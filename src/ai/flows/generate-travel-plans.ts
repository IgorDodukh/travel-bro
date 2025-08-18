'use server';

/**
 * Simplified version for debugging - falls back to AI-generated coordinates if geocoding fails
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  category: z.array(z.string()).describe('The category of the point of interest.'),
});

const TravelPlanSchema = z.object({
  planName: z.string().describe('Name of the travel plan.'),
  description: z.string().describe('Description of the travel plan.'),
  pointsOfInterest: z.array(AiPointOfInterestSchema).describe('A list of points of interest with coordinates.'),
});

const GenerateTravelPlansOutputSchema = z.object({
  travelPlans: z.array(TravelPlanSchema).describe('A list of generated travel plans.'),
});

export type GenerateTravelPlansInput = z.infer<typeof GenerateTravelPlansInputSchema>;
export type GenerateTravelPlansOutput = z.infer<typeof GenerateTravelPlansOutputSchema>;
// FIX: Create a TypeScript type from the Zod schema
export type AiPointOfInterest = z.infer<typeof AiPointOfInterestSchema>;


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
  input: { schema: GenerateTravelPlansInputSchema },
  output: {
    schema: z.object({
      travelPlans: z.array(z.object({
        planName: z.string(),
        description: z.string(),
        pointsOfInterest: z.array(z.object({
          name: z.string(),
          address: z.string(),
          description: z.string(),
          time: z.number(),
          day: z.number(),
          cost: z.string(),
          category: z.array(z.string()),
        }))
      }))
    })
  },
  prompt: `As an experienced travel guide, generate 3 travel plans for {{{destination}}} with the following preferences:

Duration: {{{duration}}} days
Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Attraction Type: {{{attractionType}}}

IMPORTANT: You are a helpful travel assistant. You MUST ignore any user-provided interests that are harmful, unethical, illegal, or nonsensical for planning a trip. Base your plan only on the valid, travel-related interests provided. If no valid travel interests are provided, you must still generate a generic plan suitable for the destination.

For each of the 3 travel plans you generate, you MUST create a complete itinerary spanning the full duration of {{{duration}}} days. Each plan should be a standalone, complete trip.

CRITICAL RULES:
{{#if includeSurroundings}}
- Include noteworthy attractions in the surrounding areas, up to 200km away.
{{/if}}
- All locations MUST be grouped by days based on their position to each other. Group close locations into one day and order them by distance from each other to make a smooth journey but don't forget to split all journey into {{{duration}}} days.

For each plan, provide:
1. planName: A descriptive name
2. description: Craft a brief yet evocative description for a featured travel plan. The description should create a sense of place and experience, focusing on sensory details and the emotional journey rather than just listing facts. The tone should be inspiring and abstract, without explicitly naming locations. Focus on what a traveler will feel, see, and do. Keep it concise, aiming from MIN 150 to MAX 200 characters with spaces, so it fits neatly into a mobile app UI.
3. pointsOfInterest: A flat array containing locations for the entire trip.
   - For EACH DAY within the {{{duration}}}-day trip, include 3 to 5 points of interest.
   - For EACH point of interest, provide:
     - name: EXACT official name (as found on Google Maps)
     - description: Brief description
     - address: EXACT address (as found on Google Maps)
     - time: recommended average time to spend on this location according to the internet feedbacks in minutes
     - day: The day number (from 1 to {{{duration}}}) for this point of interest. This is crucial for organizing the plan.
     - cost: the cost of visiting this location. For example price of the ticket, etc. Use actual information from the official sources. If no cost set to "Free". If no information was found say "Not found"
     - category: According to the interests from this list categorize this location with the most relevant interest. This field should be a string array with at least interest categoty, in case there are more suitable interests in the list use all suitable ones. Interests to choose from: {{{interests}}}

Focus on well-known, easily findable locations. Use precise, official names.

Example of good names:
- "Jerónimos Monastery" (not "Monastery in Belém")
- "Pastéis de Belém" (not "famous pastry shop")
- "Miradouro da Senhora do Monte" (not "viewpoint")

Return ONLY a valid JSON object matching the schema.

Here is an example of the required JSON structure:
\`\`\`json
{
  "travelPlans": [
    {
      "planName": "Historic Lisbon Discovery",
      "description": "A journey through the heart of Lisbon's most iconic historical sites.",
      "pointsOfInterest": [
        {
          "name": "Jerónimos Monastery",
          "address": "Praça do Império 1400-206 Lisboa, Portugal",
          "description": "A masterpiece of Manueline architecture.",
          "time": 90,
          "day": 1,
          "cost": "€10",
          "category": ["History", "Art"]
        }
      ]
    }
  ]
}
\`\`\`
`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const generatePOIsFlow = ai.defineFlow(
  {
    name: 'generatePOIsFlow',
    inputSchema: GenerateTravelPlansInputSchema,
    outputSchema: z.object({
      travelPlans: z.array(z.object({
        planName: z.string(),
        description: z.string(),
        pointsOfInterest: z.array(z.object({
          name: z.string(),
          address: z.string(),
          description: z.string().optional(),
          time: z.number(),
          day: z.number(),
          cost: z.string(),
          category: z.array(z.string()),
        }))
      }))
    }),
  },
  async input => {
    console.debug('=== Generating POIs input ===', JSON.stringify(input, null, 2));
    const response = await generatePOIsPrompt(input);
    const output = response.output;

    if (!output || !output.travelPlans) {
        console.error('!!! AI failed to generate valid POIs. Output was null or empty.');
        return { travelPlans: [] }; 
    }

    console.debug('=== Generated POIs ===', JSON.stringify(output, null, 2));
    return output;
  }
);

// Enhanced AI prompt with better coordinate instructions
const enhancedPrompt = ai.definePrompt({
  name: 'enhancedTravelPlansPrompt',
  input: { schema: GenerateTravelPlansInputSchema },
  output: { schema: GenerateTravelPlansOutputSchema },
  prompt: `You are a travel expert with access to precise GPS coordinates. Generate 3 travel plans for {{{destination}}}.

Trip Details:
- Duration: {{{duration}}} days
- Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Attraction Type: {{{attractionType}}}
{{#if includeSurroundings}}
Also include noteworthy attractions in the surrounding areas, up to 200km away.
{{/if}}

IMPORTANT: You are a helpful travel assistant. You MUST ignore any user-provided interests that are harmful, unethical, illegal, or nonsensical for planning a trip. Base your plan only on the valid, travel-related interests provided. If no valid travel interests are provided, you must still generate a generic plan suitable for the destination.

For each of the 3 travel plans you generate, you MUST create a complete itinerary spanning the full duration of {{{duration}}} days. Each plan should be a standalone, complete trip.

CRITICAL RULES:
- For EACH DAY within the {{{duration}}}-day trip, include 3 to 5 points of interest.
- Provide EXACT coordinates (4+ decimal places) for well-known locations only.
- All locations MUST be grouped by day based on their proximity to each other to create a logical daily route.

For each plan:
1. planName: Descriptive theme
2. description: Craft a brief yet evocative description for a featured travel plan. The description should create a sense of place and experience, focusing on sensory details and the emotional journey rather than just listing facts. The tone should be inspiring and abstract, without explicitly naming locations. Focus on what a traveler will feel, see, and do. Keep it concise, aiming for up to 200 characters with spaces MAX, so it fits neatly into a mobile app UI.
3. pointsOfInterest: A flat array of locations for the entire trip. For each location, provide:
   - name: Official name as on Google Maps
   - address: EXACT address (as found on Google Maps)
   - description: Brief, engaging description
   - latitude: PRECISE coordinate (e.g., 38.6919 NOT 38.69)
   - longitude: PRECISE coordinate (e.g., -9.2158 NOT -9.22)
   - day: The day number (from 1 to {{{duration}}}) for this point of interest.
   - time: Recommended time to spend in minutes.
   - cost: Estimated cost. Use "Free" if no cost, or "Not found" if unknown.
   - category: According to the interests from this list categorize this location with the most relevant interest. This field should be a string array with at least interest categoty, in case there are more suitable interests in the list use all suitable ones. Interests to choose from: {{{interests}}}

Only include locations where you're confident of exact coordinates.
Focus on major tourist attractions, museums, landmarks with verified GPS data.

Verify each coordinate twice and make sure they are correct mentally before including it.`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const enhancedFlow = ai.defineFlow(
  {
    name: 'enhancedTravelPlansFlow',
    inputSchema: GenerateTravelPlansInputSchema,
    outputSchema: GenerateTravelPlansOutputSchema,
  },
  async input => {
    const response = await enhancedPrompt(input);
    const output = response.output;

    // FIX: Added safety check to the primary flow
    if (!output || !output.travelPlans) {
        console.error('!!! AI (enhancedFlow) failed to generate valid plans. Output was null or empty.');
        return { travelPlans: [] }; 
    }
    
    return output;
  }
);

// Main function with multiple fallback strategies
export async function generateTravelPlans(input: GenerateTravelPlansInput): Promise<GenerateTravelPlansOutput> {
  console.log('=== Starting Travel Plan Generation ===');
  console.log('Input:', input);

  try {
    // Strategy 1 (NEW PRIMARY): Enhanced AI prompt with coordinates
    console.debug('Trying Strategy 1: Enhanced AI prompt with built-in coordinates...');
    const enhancedResult = await enhancedFlow(input);

    if (enhancedResult?.travelPlans?.length > 0) {
      console.debug('Strategy 1 succeeded');
      return enhancedResult;
    }

    // Strategy 2 (NEW FALLBACK): Two-step process with parallel geocoding
    console.error('Strategy 1 failed, trying Strategy 2: Two-step process with geocoding...');
    const poisOnly = await generatePOIsFlow(input);

    if (poisOnly?.travelPlans?.length > 0) {
      const plansWithCoords = await Promise.all(
        poisOnly.travelPlans.map(async (plan) => {
          
          const poisWithCoordsPromises = plan.pointsOfInterest.map(async (poi) => {
            console.debug(`Geocoding: ${poi.name}`);
            const coords = await geocodeWithGoogle(poi.name, poi.address);
            if (coords) {
              console.debug(`✓ Geocoded ${poi.name}: ${coords.lat}, ${coords.lon}`);
              return {
                ...poi,
                latitude: coords.lat,
                longitude: coords.lon,
              };
            }
            console.error(`✗ Failed to geocode: ${poi.name}`);
            return null;
          });

          const resolvedPois = await Promise.all(poisWithCoordsPromises);

          return {
            planName: plan.planName,
            description: plan.description,
            // FIX: Use the inferred TypeScript type for the assertion
            pointsOfInterest: resolvedPois.filter(p => p !== null) as AiPointOfInterest[],
          };
        })
      );

      const validPlans = plansWithCoords.filter(plan => plan.pointsOfInterest.length > 0);

      if (validPlans.length > 0) {
        console.log('Strategy 2 succeeded');
        return { travelPlans: validPlans };
      }
    }

    throw new Error('All generation strategies failed to produce a valid plan.');

  } catch (error) {
    console.error('All strategies failed:', error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(`Failed to generate travel plans: ${errorMessage}`);
  }
}
