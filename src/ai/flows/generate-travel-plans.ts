'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GooglePlaceDetailsSchema = z.object({
  formatted_phone_number: z.string().optional(),
  website: z.string().optional(),
  photos: z.array(z.string()).optional().describe('An array of fully formed image URLs.'),
  rating: z.number().optional(),
  types: z.array(z.string()).optional(),
  user_ratings_total: z.number().optional(),
  place_id: z.string().optional(),
});

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

const FinalPointOfInterestSchema = AiPointOfInterestSchema.merge(GooglePlaceDetailsSchema);

const TravelPlanSchema = z.object({
  planName: z.string().describe('Name of the travel plan.'),
  description: z.string().describe('Description of the travel plan.'),
  pointsOfInterest: z.array(FinalPointOfInterestSchema).describe('A list of points of interest with coordinates.'),
});

const GenerateTravelPlansOutputSchema = z.object({
  travelPlans: z.array(TravelPlanSchema).describe('A list of generated travel plans.'),
});

export type GenerateTravelPlansInput = z.infer<typeof GenerateTravelPlansInputSchema>;
export type GenerateTravelPlansOutput = z.infer<typeof GenerateTravelPlansOutputSchema>;
export type AiPointOfInterest = z.infer<typeof AiPointOfInterestSchema>;

const GOOGLE_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY!;

const findPlaceId = async (poi: { name: string; lat: number; lng: number; }): Promise<string | null> => {
  // Strategy 1: Text search (most reliable for name + location)
  try {
    const query = encodeURIComponent(`"${poi.name}" near ${poi.lat},${poi.lng}`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].place_id;
    }
  } catch (error) {
    console.error(`[Place ID] Text search failed for ${poi.name}:`, error);
  }

  // Strategy 2: Nearby search (good fallback)
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${poi.lat},${poi.lng}&radius=100&keyword=${encodeURIComponent(poi.name)}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].place_id;
    }
  } catch (error) {
    console.error(`[Place ID] Nearby search failed for ${poi.name}:`, error);
  }

  console.warn(`✗ [Place ID] Could not find Place ID for '${poi.name}'.`);
  return null;
};

const fetchPlaceDetails = async (placeId: string): Promise<z.infer<typeof GooglePlaceDetailsSchema> | null> => {
  try {
    const fields = [
      'place_id', 'name', 'formatted_phone_number', 'website', 'photos',
      'rating', 'user_ratings_total', 'types'
    ].join(',');

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      const result = data.result;
      let photoUrls: string[] = [];

      if (result.photos && result.photos.length > 0) {
        photoUrls = result.photos.slice(0, 5).map((photo: any) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
        );
      }
      return {
        formatted_phone_number: result.international_phone_number || result.formatted_phone_number,
        website: result.website,
        photos: photoUrls,
        // rating: result.rating, // COMMENTED OUT, NO USE CASE YET
        // user_ratings_total: result.user_ratings_total,  // COMMENTED OUT, NO USE CASE YET
        types: result.types,
        // place_id: result.place_id,
      };
    }
    return null;
  } catch (error) {
    console.error(`[Details] Error fetching details for Place ID ${placeId}:`, error);
    return null;
  }
};

async function geocodeWithGoogle(
  locationName: string,
  address: string
): Promise<{ lat: number; lon: number } | null> {
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
  prompt: `As an experienced travel guide, generate 1 travel plan for {{{destination}}} with the following preferences:

Duration: {{{duration}}} days
Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Attraction Type: {{{attractionType}}}

IMPORTANT: You are a helpful travel assistant. You MUST ignore any user-provided interests that are harmful, unethical, illegal, or nonsensical for planning a trip. Base your plan only on the valid, travel-related interests provided. If no valid travel interests are provided, you must still generate a generic plan suitable for the destination.

For each of 1 generated travel plans you generate, you MUST create a complete itinerary spanning the full duration of {{{duration}}} days. Each plan should be a standalone, complete trip.

CRITICAL RULES:
{{#if includeSurroundings}}
- Include noteworthy attractions in the surrounding areas, up to 200km away.
{{/if}}
- All fields for pointsOfInterest are mandatory. They should always be present with the value which is NOT null and NOT empty.
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
     - cost: the cost of visiting this location. For example price of the ticket, average cost of food, etc. Use actual information from the official sources. If no cost set to "Free". If the price is not fixed set to "Varies". If no information was found say "Not found". Supported format is [Value (additional details)]. Example: "Free", "€10", "$15 (adults only)", "£20", "Not found", "Varies"
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
  prompt: `You are a travel expert with access to precise GPS coordinates. Generate 1 travel plan for {{{destination}}}.

Trip Details:
- Duration: {{{duration}}} days
- Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
- Attraction Type: {{{attractionType}}}
{{#if includeSurroundings}}
Also include noteworthy attractions in the surrounding areas, up to 200km away.
{{/if}}

IMPORTANT: You are a helpful travel assistant. You MUST ignore any user-provided interests that are harmful, unethical, illegal, or nonsensical for planning a trip. Base your plan only on the valid, travel-related interests provided. If no valid travel interests are provided, you must still generate a generic plan suitable for the destination.

For each of 1 generated travel plan you generate, you MUST create a complete itinerary spanning the full duration of {{{duration}}} days. Each plan should be a standalone, complete trip.

CRITICAL RULES:
- For EACH DAY within the {{{duration}}}-day trip, include 3 to 5 points of interest.
- Provide EXACT coordinates (4+ decimal places) for well-known locations only.
- All fields for pointsOfInterest are mandatory. They should always be present with the value which is NOT null and NOT empty.
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
   - cost: the cost of visiting this location. For example price of the ticket, average cost of food, etc. Use actual information from the official sources. If no cost set to "Free". If the price is not fixed set to "Varies". If no information was found say "Not found". Supported format is [Value (additional details)]. Example: "Free", "€10", "$15 (adults only)", "£20", "Not found", "Varies"
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
  console.log('=== 1. Starting AI Travel Plan Generation ===');

  // Let the AI generate the base plan first.
  const aiResult = await enhancedFlow(input);

  if (!aiResult?.travelPlans?.length) {
    console.error('!!! AI failed to generate any valid plans. Aborting.');
    // You might want to try your fallback strategy here if needed
    throw new Error('Failed to generate a base travel plan from the AI.');
  }

  console.log('=== 2. AI Generation Successful. Starting Data Augmentation ===');

  // Now, augment each POI with rich data from Google Places
  const enrichedTravelPlans = await Promise.all(
    aiResult.travelPlans.map(async (plan) => {

      const enrichedPoisPromises = plan.pointsOfInterest.map(async (poi) => {
        // Find the Place ID for the AI-generated POI
        const placeId = await findPlaceId({ name: poi.name, lat: poi.latitude, lng: poi.longitude });

        if (placeId) {
          // If found, fetch the rich details
          const details = await fetchPlaceDetails(placeId);
          if (details) {
            // Merge the original AI data with the new Google data
            return { ...poi, ...details, cost: poi.cost.replace(/\n/g, '') };
          }
        }

        // If anything fails, gracefully fall back to the original AI-generated data
        return poi;
      });

      const resolvedPois = await Promise.all(enrichedPoisPromises);

      return {
        ...plan,
        pointsOfInterest: resolvedPois,
      };
    })
  );

  console.log('=== 3. Data Augmentation Complete. Returning final plans. ===');
  return { travelPlans: enrichedTravelPlans };
}
