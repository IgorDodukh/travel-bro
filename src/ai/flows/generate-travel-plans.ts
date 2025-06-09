'use server';

/**
 * Simplified version for debugging - falls back to AI-generated coordinates if geocoding fails
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTravelPlansInputSchema = z.object({
  destination: z.string().describe('The destination for the travel plan.'),
  duration: z.number().describe('The duration of the trip in days.'),
  accommodation: z.string().describe('The preferred type of accommodation.'),
  transport: z.string().describe('The preferred mode of transportation.'),
  interests: z.array(z.string()).describe('A list of interests for the travel plan.'),
  attractionType: z.string().describe('The type of attractions to suggest.'),
});

const AiPointOfInterestSchema = z.object({
  name: z.string().describe('The name of the point of interest.'),
  description: z.string().optional().describe('A brief description of the point of interest.'),
  latitude: z.number().describe('The precise geographic latitude of the point of interest.'),
  longitude: z.number().describe('The precise geographic longitude of the point of interest.'),
});

const TravelPlanSchema = z.object({
  planName: z.string().describe('Name of the travel plan.'),
  pointsOfInterest: z.array(AiPointOfInterestSchema).describe('A list of points of interest with coordinates.'),
});

const GenerateTravelPlansOutputSchema = z.object({
  travelPlans: z.array(TravelPlanSchema).describe('A list of generated travel plans.'),
});

export type GenerateTravelPlansInput = z.infer<typeof GenerateTravelPlansInputSchema>;
export type GenerateTravelPlansOutput = z.infer<typeof GenerateTravelPlansOutputSchema>;

// Simplified geocoding function
async function simpleGeocode(locationName: string, city: string, country: string): Promise<{lat: number, lon: number} | null> {
  const query = encodeURIComponent(`${locationName}, ${city}, ${country}`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TravelPlannerApp/1.0',
      },
    });

    if (!response.ok) {
      console.error(`Geocoding HTTP error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Geocoding error for ${locationName}:`, error);
    return null;
  }
}

// Two-step approach: Generate POIs first, then get coordinates
const generatePOIsPrompt = ai.definePrompt({
  name: 'generatePOIsOnly',
  input: {schema: GenerateTravelPlansInputSchema},
  output: {schema: z.object({
    travelPlans: z.array(z.object({
      planName: z.string(),
      pointsOfInterest: z.array(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
    }))
  })},
  prompt: `Generate 3 travel plans for {{{destination}}} with the following preferences:

Duration: {{{duration}}} days
Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Attraction Type: {{{attractionType}}}

For each plan, provide:
1. planName: A descriptive name
2. pointsOfInterest: Array of 5-7 locations with:
   - name: EXACT official name (as found on Google Maps)
   - description: Brief description

Focus on well-known, easily findable locations. Use precise, official names.

Example of good names:
- "Jerónimos Monastery" (not "Monastery in Belém")
- "Pastéis de Belém" (not "famous pastry shop")
- "Miradouro da Senhora do Monte" (not "viewpoint")

Return JSON without coordinates.`,
});

const generatePOIsFlow = ai.defineFlow(
  {
    name: 'generatePOIsFlow',
    inputSchema: GenerateTravelPlansInputSchema,
    outputSchema: z.object({
      travelPlans: z.array(z.object({
        planName: z.string(),
        pointsOfInterest: z.array(z.object({
          name: z.string(),
          description: z.string().optional(),
        }))
      }))
    }),
  },
  async input => {
    const {output} = await generatePOIsPrompt(input);
    return output!;
  }
);

// Enhanced AI prompt with better coordinate instructions
const enhancedPrompt = ai.definePrompt({
  name: 'enhancedTravelPlansPrompt',
  input: {schema: GenerateTravelPlansInputSchema},
  output: {schema: GenerateTravelPlansOutputSchema},
  prompt: `You are a travel expert with access to precise GPS coordinates. Generate 3 travel plans for {{{destination}}}.

Trip Details:
- Duration: {{{duration}}} days
- Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Attraction Type: {{{attractionType}}}

CRITICAL: Provide EXACT coordinates (4+ decimal places) for well-known locations only.

For each plan:
1. planName: Descriptive theme
2. pointsOfInterest: 3-5 locations for each traveling day depending on the duration, type of selected transport which is {{{transport}}} and attraction type and interests preferences
   - name:
   - name: Official name as on Google Maps
   - description: Brief, engaging description
   - latitude: PRECISE coordinate (e.g., 38.6919 NOT 38.69)
   - longitude: PRECISE coordinate (e.g., -9.2158 NOT -9.22)

Only include locations where you're confident of exact coordinates.
Focus on attractions, museums, landmarks with verified GPS data.

Verify each coordinate mentally before including it.`,
});

const enhancedFlow = ai.defineFlow(
  {
    name: 'enhancedTravelPlansFlow',
    inputSchema: GenerateTravelPlansInputSchema,
    outputSchema: GenerateTravelPlansOutputSchema,
  },
  async input => {
    const {output} = await enhancedPrompt(input);
    return output!;
  }
);

// Main function with multiple fallback strategies
export async function generateTravelPlans(input: GenerateTravelPlansInput): Promise<GenerateTravelPlansOutput> {
  console.log('=== Starting Travel Plan Generation ===');
  console.log('Input:', input);

  try {
    // Strategy 1: Two-step process with external geocoding
    console.log('Trying Strategy 1: Two-step process with geocoding...');
    
    const poisOnly = await generatePOIsFlow(input);
    console.log('POIs generated:', poisOnly);

    if (poisOnly?.travelPlans?.length > 0) {
      const city = input.destination.split(',')[0]?.trim() || input.destination;
      const country = input.destination.split(',').pop()?.trim() || 'Portugal';
      
      const plansWithCoords = await Promise.all(
        poisOnly.travelPlans.map(async (plan) => {
          console.log(`Processing plan: ${plan.planName}`);
          
          const poisWithCoords = [];
          
          for (const poi of plan.pointsOfInterest) {
            console.log(`Geocoding: ${poi.name}`);
            const coords = await simpleGeocode(poi.name, city, country);
            
            if (coords) {
              poisWithCoords.push({
                name: poi.name,
                description: poi.description,
                latitude: coords.lat,
                longitude: coords.lon,
              });
              console.log(`✓ Geocoded ${poi.name}: ${coords.lat}, ${coords.lon}`);
            } else {
              console.log(`✗ Failed to geocode: ${poi.name}`);
            }
          }
          
          return {
            planName: plan.planName,
            pointsOfInterest: poisWithCoords,
          };
        })
      );
      
      const validPlans = plansWithCoords.filter(plan => plan.pointsOfInterest.length > 0);
      
      if (validPlans.length > 0) {
        console.log('Strategy 1 succeeded');
        return { travelPlans: validPlans };
      }
    }

    // Strategy 2: Enhanced AI prompt with better coordinate instructions
    console.log('Strategy 1 failed, trying Strategy 2: Enhanced AI prompt...');
    const enhancedResult = await enhancedFlow(input);
    
    if (enhancedResult?.travelPlans?.length > 0) {
      console.log('Strategy 2 succeeded');
      return enhancedResult;
    }

    // Strategy 3: Fallback with minimal filtering
    console.log('Strategy 2 failed, using fallback strategy...');
    return {
      travelPlans: [{
        planName: `${input.destination} Explorer`,
        pointsOfInterest: [{
          name: 'City Center',
          description: 'Explore the heart of the city',
          latitude: 38.7223,  // Lisbon center as example
          longitude: -9.1393,
        }]
      }]
    };

  } catch (error) {
    console.error('All strategies failed:', error);
    let errorMessage = "An unexpected error occurred while generating travel plans.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(`Failed to generate travel plans: ${errorMessage}`);
  }
}