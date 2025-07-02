
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
  includeSurroundings: z.boolean().optional().describe('Whether to include attractions in the surrounding area (up to 200km).'),
});

const AiPointOfInterestSchema = z.object({
  name: z.string().describe('The name of the point of interest.'),
  description: z.string().optional().describe('A brief description of the point of interest.'),
  latitude: z.number().describe('The precise geographic latitude of the point of interest.'),
  longitude: z.number().describe('The precise geographic longitude of the point of interest.'),
  address: z.string().describe('The exact address of the point of interest.'),
  time: z.number().describe('The approximate time to spend at the point of interest (minutes).'),
  day: z.number().describe('The day of the trip when the point of interest is recommended to be visited.'),
  cost: z.string().describe('The estimated cost of the point of interest.'),
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
async function simpleGeocode(
  locationName: string,
  city: string,
  country: string
): Promise<{ lat: number; lon: number } | null> {
  locationName = normalizePlaceName(locationName);
  const formats = [
    `${locationName}, ${city}, ${country}`,
    `${locationName}, ${country}`,
    `${locationName}, ${city}`,
    `${city}, ${locationName}, ${country}`,
    `${locationName}`,
  ];

  for (const format of formats) {
    const query = encodeURIComponent(format);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    console.log(`🔍 Trying geocode ${locationName}: ${url}`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // respect rate limits
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TravelPlannerApp/1.0',
        },
      });

      if (!response.ok) {
        console.error(`⚠️ Geocoding HTTP error: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
        };
      }
    } catch (error) {
      console.error(`❌ Geocoding error for ${format}:`, error);
    }
  }

  console.warn(`⛔ Failed to geocode after all attempts: ${locationName}`);
  return null;
}

async function geocodeWithGoogle(
  locationName: string,
  address: string
): Promise<{ lat: number; lon: number } | null> {
  const GOOGLE_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY!;
  const query = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${GOOGLE_API_KEY}`;

  console.debug(`📍 Trying geocode for [${locationName}]: ${url}`);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lon: lng };
    } else {
      console.warn(`⚠️ Google Geocoding API: ${data.status}`);
    }
  } catch (error) {
    console.error(`❌ Google geocoding error for ${address}:`, error);
  }
  return null;
}

function normalizePlaceName(name: string) {
  return name
    .trim()
    .replace(/[^\w\s]/gi, '') // remove special chars
    .replace(/\s{2,}/g, ' ')   // collapse extra spaces
    .toLowerCase();
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
        address: z.string(),
        description: z.string(),
        time: z.number(),
        day: z.number(),
        cost: z.string(),
      }))
    }))
  })},
  prompt: `As an experienced travel guide, generate 3 travel plans for {{{destination}}} with the following preferences:

Duration: {{{duration}}} days
Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Attraction Type: {{{attractionType}}}

CRITICAL RULES:
{{#if includeSurroundings}}
- Include noteworthy attractions in the surrounding areas, up to 200km away.
{{/if}}
- All locations MUST be grouped by days based on their position to each other. Group close locations into one day and order them by distance from each other to make a smooth journey but don't forget to split all journey into {{{duration}}} days.

For each plan, provide:
1. planName: A descriptive name
2. pointsOfInterest: Array of minimum 3 to 5 locations per day for each visited days from {{{duration}}} days with:
   - name: EXACT official name (as found on Google Maps)
   - description: Brief description
   - address: EXACT address (as found on Google Maps)
   - time: recommended average time to spent on this location according to the internet feedbacks in minutes
   - day: recommended day number of the whole travel out of 3 days when it is better to visit this location because it is close to other locations in the same area
   - cost: the cost of visiting this location. For example price of the ticket, etc. Use actual information from the official sources. If no cost set to "Free". If no information was found say "Not found"

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
          address: z.string(),
          description: z.string().optional(),
          time: z.number(),
          day: z.number(),
          cost: z.string(),
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
{{#if includeSurroundings}}
Also include noteworthy attractions in the surrounding areas, up to 200km away.
{{/if}}

CRITICAL RULES:
- Provide EXACT coordinates (4+ decimal places) for well-known locations only.
- Include noteworthy attractions in the surrounding areas, up to 200km away.
- All locations MUST be grouped by days based on their position to each other. Group close locations into one day but don't forget to split all journey into {{{duration}}} days.

For each plan:
1. planName: Descriptive theme
2. pointsOfInterest: 5-7 locations with:
   - name: Official name as on Google Maps
   - address: EXACT address (as found on Google Maps)
   - description: Brief, engaging description
   - latitude: PRECISE coordinate (e.g., 38.6919 NOT 38.69)
   - longitude: PRECISE coordinate (e.g., -9.2158 NOT -9.22)

Only include locations where you're confident of exact coordinates.
Focus on major tourist attractions, museums, landmarks with verified GPS data.

Verify each coordinate twice and make sure they are correct mentally before including it.`,
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
      
      const plansWithCoords = await Promise.all(
        poisOnly.travelPlans.map(async (plan) => {
          console.log(`>>> Processing plan: ${plan.planName} with ${plan.pointsOfInterest.length} POIs`);
          
          const poisWithCoords = [];
          
          for (const poi of plan.pointsOfInterest) {
            console.debug(`Geocoding: ${poi.name}`);
            const coords = await geocodeWithGoogle(poi.name, poi.address);
            
            if (coords) {
              poisWithCoords.push({
                name: poi.name,
                description: poi.description,
                address: poi.address,
                day: poi.day,
                time: poi.time,
                cost: poi.cost,
                latitude: coords.lat,
                longitude: coords.lon,
              });
              console.debug(`✓ Geocoded ${poi.name}: ${coords.lat}, ${coords.lon}`);
            } else {
              console.error(`✗ Failed to geocode: ${poi.name}`);
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
    console.error('Strategy 1 failed, trying Strategy 2: Enhanced AI prompt...');
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
          address: "City Center, Lisbon, Portugal",
          day: 1,
          time: 111,
          cost: "Free",

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
