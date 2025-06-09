
'use server';

/**
 * @fileOverview A travel plan generation AI flow.
 *
 * - generateTravelPlans - A function that handles travel plan generation with multiple strategies.
 * - GenerateTravelPlansInput - The input type for the generateTravelPlans function.
 * - GenerateTravelPlansOutput - The return type for the generateTravelPlans function.
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
  name: z.string().describe('The official or common name of the point of interest.'),
  description: z.string().optional().describe('A brief, engaging description of the point of interest.'),
  latitude: z.number().describe('The precise geographic latitude of the point of interest (at least 4 decimal places, e.g., 48.8584). CRITICAL for mapping.'),
  longitude: z.number().describe('The precise geographic longitude of the point of interest (at least 4 decimal places, e.g., 2.2945). CRITICAL for mapping.'),
});

const TravelPlanSchema = z.object({
  planName: z.string().describe('A descriptive name for the travel plan (e.g., "Parisian Highlights Adventure").'),
  pointsOfInterest: z.array(AiPointOfInterestSchema).describe('A list of points of interest with their names, descriptions, and ACCURATE geographic coordinates (latitude and longitude).'),
});

const GenerateTravelPlansOutputSchema = z.object({
  travelPlans: z.array(TravelPlanSchema).describe('A list of 3 generated travel plans, each with multiple points of interest.'),
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
        'User-Agent': 'RoamReadyApp/1.0 (Firebase Studio)',
      },
    });

    if (!response.ok) {
      console.error(`Geocoding HTTP error for "${locationName}": ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    console.log(`No geocoding results for "${locationName}" in ${city}, ${country}`);
    return null;
  } catch (error) {
    console.error(`Geocoding error for "${locationName}":`, error);
    return null;
  }
}

// Schema for POIs without coordinates (for Strategy 1)
const PointOfInterestNameOnlySchema = z.object({
  name: z.string().describe("EXACT official name of the location (as found on Google Maps). This is crucial for later geocoding."),
  description: z.string().optional().describe("Brief description of the location."),
});

const TravelPlanNameOnlySchema = z.object({
  planName: z.string().describe("A descriptive name for the travel plan."),
  pointsOfInterest: z.array(PointOfInterestNameOnlySchema).describe("List of points of interest, names and descriptions only."),
});


const generatePOIsPrompt = ai.definePrompt({
  name: 'generatePOIsOnly',
  input: {schema: GenerateTravelPlansInputSchema},
  output: {schema: z.object({
    travelPlans: z.array(TravelPlanNameOnlySchema)
  })},
  prompt: `You are an expert travel planner. Generate 3 distinct travel plan options for {{{destination}}} based on the following user preferences. For each plan, provide a unique 'planName' and a list of 'pointsOfInterest'.

User Preferences:
- Duration: {{{duration}}} days
- Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Attraction Type: {{{attractionType}}}
- Transport: {{{transport}}}

Instructions for each of the 3 travel plans:
1.  **POI Quantity**:
    *   The 'pointsOfInterest' list for this plan MUST contain a TOTAL of ({{{duration}}} * 3) to ({{{duration}}} * 5) location names.
    *   For example, if duration is 3 days, provide 9 to 15 location names in total for THIS plan. If duration is 1 day, provide 3 to 5.
2.  **POI Details**:
    *   For each point of interest, provide:
        *   'name': The EXACT official name of the location, as it would appear on Google Maps. This is critical.
        *   'description': A brief, engaging description.
3.  **Transport Consideration**:
    *   When selecting these POI names, consider that they will be geocoded and distributed across the {{{duration}}} days by the application.
    *   The density and geographical spread of a conceptual day's worth of POIs (3-5 items) MUST be realistic for the user's chosen 'transport': '{{{transport}}}'.
        *   If 'Walking', the chosen POI names for a conceptual day should represent locations that are very close to each other.
        *   If 'Car', POI names can represent locations that are more spread out.
        *   If 'Public Transport', ensure chosen POI names represent locations accessible via such means.
4.  **Focus**:
    *   Concentrate on well-known, easily findable locations relevant to the user's interests and attraction type. Use precise, official names.

Example of good POI names:
- "Jerónimos Monastery" (not "Monastery in Belém")
- "Pastéis de Belém" (not "famous pastry shop")
- "Miradouro da Senhora do Monte" (not "viewpoint")

Return JSON. Do NOT include coordinates in this step.`,
});


const generatePOIsFlow = ai.defineFlow(
  {
    name: 'generatePOIsFlow',
    inputSchema: GenerateTravelPlansInputSchema,
    outputSchema: z.object({ // Matches the output of generatePOIsPrompt
      travelPlans: z.array(TravelPlanNameOnlySchema)
    }),
  },
  async input => {
    const {output} = await generatePOIsPrompt(input);
    return output!;
  }
);

const enhancedPrompt = ai.definePrompt({
  name: 'enhancedTravelPlansPrompt',
  input: {schema: GenerateTravelPlansInputSchema},
  output: {schema: GenerateTravelPlansOutputSchema}, // Uses AiPointOfInterestSchema with coordinates
  prompt: `You are a travel expert with access to precise GPS coordinates. Generate 3 distinct travel plans for {{{destination}}}.

User Preferences:
- Duration: {{{duration}}} days
- Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Attraction Type: {{{attractionType}}}
- Transport: {{{transport}}}

CRITICAL REQUIREMENTS for each plan:
1.  **planName**: A descriptive theme or name for the plan.
2.  **pointsOfInterest**:
    *   This list MUST contain a TOTAL of ({{{duration}}} * 3) to ({{{duration}}} * 5) points of interest for the entire plan.
        *   Example: If duration is 3 days, provide 9 to 15 POIs in total for THIS plan. If duration is 1 day, provide 3-5 POIs.
    *   When selecting these POIs, consider that they will be distributed across the {{{duration}}} days by the application.
    *   The density and geographical spread of a conceptual day's worth of POIs (3-5 items) MUST be realistic for the user's chosen 'transport': '{{{transport}}}'.
        *   If 'Walking', ensure that any 3-5 POIs conceptually grouped for a day are very close and realistically walkable.
        *   If 'Car', POIs for a conceptual day can be more spread out.
        *   If 'Public Transport', ensure POIs for a conceptual day are accessible via such means.
    *   For each POI in this list, provide:
        *   'name': Official name as on Google Maps.
        *   'description': Brief, engaging description.
        *   'latitude': PRECISE geographic latitude (e.g., 38.6919, NOT 38.69). Strive for factual accuracy.
        *   'longitude': PRECISE geographic longitude (e.g., -9.2158, NOT -9.22). Strive for factual accuracy.
3.  **Coordinate Accuracy**: Only include locations where you are confident of the exact coordinates (at least 4 decimal places). Verify each coordinate mentally. Focus on attractions, museums, landmarks with verified GPS data.

Return JSON.`,
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

export async function generateTravelPlans(input: GenerateTravelPlansInput): Promise<GenerateTravelPlansOutput> {
  console.log('=== Starting Travel Plan Generation ===');
  console.log('Input:', input);

  try {
    // Strategy 1: Two-step process with external geocoding
    console.log('Trying Strategy 1: Two-step process with geocoding...');
    
    const poisOnlyOutput = await generatePOIsFlow(input);
    console.log('POIs (names only) generated by Strategy 1:', JSON.stringify(poisOnlyOutput, null, 2));

    if (poisOnlyOutput?.travelPlans?.length > 0) {
      // Determine city and country more robustly
      const destinationParts = input.destination.split(',').map(part => part.trim());
      const city = destinationParts[0] || input.destination;
      // Assume country is the last part if multiple parts, otherwise default or could be passed explicitly
      const country = destinationParts.length > 1 ? destinationParts[destinationParts.length - 1] : 'Unknown Country (geocoding might be less accurate)'; 
      
      const plansWithCoordsPromises = poisOnlyOutput.travelPlans.map(async (planWithoutCoords) => {
        console.log(`Processing plan (Strategy 1): ${planWithoutCoords.planName}`);
        
        const poisWithCoords = [];
        
        if (planWithoutCoords.pointsOfInterest && planWithoutCoords.pointsOfInterest.length > 0) {
          for (const poiNameOnly of planWithoutCoords.pointsOfInterest) {
            console.log(`Geocoding (Strategy 1): ${poiNameOnly.name} in ${city}, ${country}`);
            const coords = await simpleGeocode(poiNameOnly.name, city, country);
            
            if (coords) {
              poisWithCoords.push({
                name: poiNameOnly.name,
                description: poiNameOnly.description,
                latitude: coords.lat,
                longitude: coords.lon,
              });
              console.log(`✓ Geocoded ${poiNameOnly.name}: ${coords.lat}, ${coords.lon}`);
            } else {
              console.log(`✗ Failed to geocode (Strategy 1): ${poiNameOnly.name}. Skipping this POI.`);
            }
          }
        } else {
          console.log(`Plan "${planWithoutCoords.planName}" has no POIs from generatePOIsFlow.`);
        }
        
        return {
          planName: planWithoutCoords.planName,
          pointsOfInterest: poisWithCoords, // This will be an array of AiPointOfInterestSchema compatible objects
        };
      });
      
      const resolvedPlansWithCoords = await Promise.all(plansWithCoordsPromises);
      // Filter out plans that ended up with no geocoded POIs
      const validPlansFromStrategy1 = resolvedPlansWithCoords.filter(plan => plan.pointsOfInterest.length > 0);
      
      if (validPlansFromStrategy1.length > 0) {
        console.log('Strategy 1 succeeded with geocoded POIs:', JSON.stringify({ travelPlans: validPlansFromStrategy1 }, null, 2));
        return { travelPlans: validPlansFromStrategy1 };
      } else {
        console.log('Strategy 1 did not produce any plans with successfully geocoded POIs.');
      }
    } else {
      console.log('Strategy 1 (generatePOIsFlow) did not return any travel plans.');
    }

    // Strategy 2: Enhanced AI prompt with direct coordinate generation
    console.log('Strategy 1 failed or produced no valid plans, trying Strategy 2: Enhanced AI prompt for direct coordinates...');
    const enhancedResult = await enhancedFlow(input);
     console.log('Result from Strategy 2 (enhancedFlow):', JSON.stringify(enhancedResult, null, 2));
    
    if (enhancedResult?.travelPlans?.length > 0) {
      // Further filter to ensure plans from strategy 2 actually have POIs
      const validPlansFromStrategy2 = enhancedResult.travelPlans.filter(plan => plan.pointsOfInterest && plan.pointsOfInterest.length > 0);
      if (validPlansFromStrategy2.length > 0) {
        console.log('Strategy 2 succeeded with POIs.');
        return { travelPlans: validPlansFromStrategy2 };
      } else {
         console.log('Strategy 2 produced plans, but they had no pointsOfInterest.');
      }
    } else {
      console.log('Strategy 2 (enhancedFlow) did not return any travel plans or plans were empty.');
    }

    // Strategy 3: Fallback with minimal filtering
    console.log('All strategies failed or produced no usable plans, using fallback strategy...');
    return {
      travelPlans: [{
        planName: `${input.destination} Default Explorer (Fallback)`,
        pointsOfInterest: [{
          name: 'City Center Landmark (Example)',
          description: 'Explore the heart of the city or a major landmark.',
          latitude: 38.7223,  // Example: Lisbon center
          longitude: -9.1393,
        }]
      }]
    };

  } catch (error) {
    console.error('Critical error in generateTravelPlans:', error);
    let errorMessage = "An unexpected error occurred while generating travel plans.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Throwing an error here might be better for the client to handle than returning a hardcoded fallback
    // depending on UI/UX requirements. For now, returning a fallback.
    // throw new Error(`Failed to generate travel plans: ${errorMessage}`);
     return { // Fallback response on critical error
      travelPlans: [{
        planName: `Error Plan for ${input.destination}`,
        pointsOfInterest: [{
          name: 'Error Placeholder',
          description: `Could not generate plan due to: ${errorMessage.substring(0,100)}`,
          latitude: 0,
          longitude: 0,
        }]
      }]
    };
  }
}

    