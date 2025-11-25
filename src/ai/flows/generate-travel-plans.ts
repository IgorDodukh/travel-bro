'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MonthlyRatingSchema = z.object({
  month: z.string().describe('Month number (1-12)'),
  rating: z.number().describe('Rating from 0-10'),
});

const SafetyRatingSchema = z.object({
  rating: z.string().describe('Safety level (1-10)'),
  description: z.string().describe('Brief explanation of the safety rating'),
  sources: z.array(z.string()).describe('Sources used to determine the safety rating'),
});

const AccommodationPriceSchema = z.object({
  currency: z.string().describe('Currency code (e.g., EUR, USD)'),
  price: z.number().describe('Average price per night'),
});

const TransportOptionSchema = z.object({
  name: z.string().describe('Name of the transport option (e.g., "Single Ticket (90 min)")'),
  priceDisplay: z.string().describe('Price with currency (e.g., "€2.20")'),
  details: z.string().describe('Details about this option.'),
});

const PrimaryTransportOptionSchema = z.object({
  name: z.string().describe('Name of the recommended transport option (e.g., "24h Day Pass")'),
  price: z.string().describe('Price as a string or number for calculations.'),
  priceDisplay: z.string().describe('Price with currency (e.g., "€7.60")'),
  description: z.string().describe('Why this option is recommended for the tourist.'),
});

const TransportDetailsSchema = z.object({
  localCurrency: z.string().describe('Local currency (e.g., EUR, USD)'),
  localCurrencyCode: z.string().describe('Local currency symbol (e.g., €, $)'),
  primaryOption: PrimaryTransportOptionSchema.describe('The single best value option for the tourist.'),
  otherOptions: z.array(TransportOptionSchema).describe('A list of other common transport options.'),
  generalNote: z.string().describe('A general tip for public transport (e.g., where to buy, how to validate).'),
});

const GooglePlaceDetailsSchema = z.object({
  formatted_phone_number: z.string().optional(),
  website: z.string().optional(),
  photos: z.array(z.string()).optional().describe('An array of fully formed image URLs.'),
  rating: z.number().optional(),
  types: z.array(z.string()).optional(),
  user_ratings_total: z.number().optional(),
  place_id: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const GenerateTravelPlansInputSchema = z.object({
  destination: z.string().describe('The destination for the travel plan.'),
  duration: z.number().describe('The duration of the trip in days.'),
  accommodation: z.string().optional().describe('The preferred type of accommodation.'),
  transport: z.string().optional().describe('The preferred mode of transportation.'),
  budget: z.string().describe('Expected travel budget.'),
  interests: z.array(z.string()).describe('A list of interests for the travel plan.'),
  attractionType: z.string().describe('The type of attractions to suggest.'),
  includeSurroundings: z.boolean().optional().describe('Whether to include attractions in the surrounding area (up to 200km).'),
  christmasMode: z.boolean().optional().describe('Whether to focus on Christmas related locations and recommendations.'),
});

const AiPointOfInterestSchema = z.object({
  name: z.string().describe('The name of the point of interest.'),
  description: z.string().optional().describe('A brief description of the point of interest.'),
  latitude: z.number().describe('The PRECISE geographic latitude (AI guess).'),
  longitude: z.number().describe('The PRECISE geographic longitude (AI guess).'),
  address: z.string().describe('The exact address of the point of interest.'),
  time: z.number().describe('The approximate time to spend at the point of interest (minutes).'),
  day: z.number().describe('The day of the trip when the point of interest is recommended to be visited.'),
  cost: z.string().describe('The estimated cost of the point of interest.'),
  category: z.array(z.string()).describe('The category of the point of interest.'),
});

const FinalPointOfInterestSchema = AiPointOfInterestSchema.merge(GooglePlaceDetailsSchema).extend({
  latitude: z.number(),
  longitude: z.number(),
});


const TravelPlanSchema = z.object({
  planName: z.string().describe('Name of the travel plan.'),
  description: z.string().describe('Description of the travel plan.'),
  monthlyRatings: z.array(MonthlyRatingSchema).describe('Array of monthly ratings where each object contains month number (1-12) and rating (0-10).'),
  safetyRating: SafetyRatingSchema.describe('Safety rating for the destination.'),
  accommodationPrice: z.array(AccommodationPriceSchema).describe('Array of accommodation prices where each object contains currency code and price.'),
  transportDetails: TransportDetailsSchema.optional().describe('Details about local public transport costs and options.'),
  pointsOfInterest: z.array(FinalPointOfInterestSchema).describe('A list of points of interest with coordinates.'), // Uses Final schema
});

const GenerateTravelPlansOutputSchema = z.object({
  travelPlans: z.array(TravelPlanSchema).describe('A list of generated travel plans.'),
});

export type GenerateTravelPlansInput = z.infer<typeof GenerateTravelPlansInputSchema>;
export type GenerateTravelPlansOutput = z.infer<typeof GenerateTravelPlansOutputSchema>;
export type AiPointOfInterest = z.infer<typeof AiPointOfInterestSchema>;

const GOOGLE_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY!;

const findPlaceId = async (poi: AiPointOfInterest, destination: string): Promise<string | null> => {

  // Strategy 1: Text search using Name, Address, and Destination (Primary and most specific)
  try {
    const query = encodeURIComponent(`${poi.name}, ${poi.address}, ${destination}`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}`;
    console.log(`[Place ID - Strategy 1] Searching Text: "${poi.name}, ${poi.address}, ${destination}"`);
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].place_id;
    } else {
      console.log(`[Place ID - Strategy 1] Text search failed or yielded no results for '${poi.name}' with address+destination. Status: ${data.status}`);
    }
  } catch (error) {
    console.error(`[Place ID - Strategy 1] Text search with address failed for ${poi.name}:`, error);
  }

  // Strategy 2: Text search using only Name and Destination (Fallback)
  try {
    const query = encodeURIComponent(`${poi.name}, ${destination}`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}`;
    console.log(`[Place ID - Strategy 2] Searching Text: "${poi.name}, ${destination}"`);
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].place_id;
    } else {
      console.log(`[Place ID - Strategy 2] Text search failed or yielded no results for '${poi.name}' with destination. Status: ${data.status}`);
    }
  } catch (error) {
    console.error(`[Place ID - Strategy 2] Text search with destination failed for ${poi.name}:`, error);
  }


  // Strategy 3: Nearby search using AI's coordinates (Last Resort Fallback)
  // This might still pick the wrong place if AI coords are way off, but it's better than nothing.
  try {
    const radius = 500;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${poi.latitude},${poi.longitude}&radius=${radius}&keyword=${encodeURIComponent(poi.name)}&key=${GOOGLE_API_KEY}`;
    console.log(`[Place ID - Strategy 3] Searching Nearby ${poi.latitude},${poi.longitude} (radius ${radius}m) for keyword: ${poi.name}`);
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].place_id;
    } else {
      console.log(`[Place ID - Strategy 3] Nearby search failed or yielded no results for '${poi.name}'. Status: ${data.status}`);
    }
  } catch (error) {
    console.error(`[Place ID - Strategy 3] Nearby search failed for ${poi.name}:`, error);
  }

  console.error(`✗ [Place ID] Could NOT find a reliable Place ID for '${poi.name}' at address '${poi.address}'. Returning null.`);
  return null;
};

const fetchPlaceDetails = async (placeId: string): Promise<Partial<z.infer<typeof GooglePlaceDetailsSchema>> | null> => {
  try {
    const fields = [
      'place_id', 'name', 'formatted_phone_number', 'website', 'photos',
      'rating', 'user_ratings_total', 'types', 'geometry'
    ].join(',');

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      const result = data.result;
      let photoUrls: string[] | undefined = undefined;

      if (result.photos && result.photos.length > 0) {
        photoUrls = result.photos.slice(0, 5).map((photo: any) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`
        );
      }

      const latitude = result.geometry?.location?.lat;
      const longitude = result.geometry?.location?.lng;

      if (latitude === undefined || longitude === undefined) {
        console.warn(`[Details] Missing geometry information for Place ID ${placeId}`);
      }

      return {
        formatted_phone_number: result.international_phone_number || result.formatted_phone_number,
        website: result.website,
        photos: photoUrls,
        rating: result.rating,
        user_ratings_total: result.user_ratings_total,
        types: result.types,
        place_id: result.place_id,
        latitude: latitude,
        longitude: longitude,
      };
    } else {
      console.error(`[Details] Failed to fetch details for Place ID ${placeId}. Status: ${data.status}, Error: ${data.error_message || 'No error message'}`);
    }
    return null;
  } catch (error) {
    console.error(`[Details] Network or parsing error fetching details for Place ID ${placeId}:`, error);
    return null;
  }
};


const generatePOIsPrompt = ai.definePrompt({
  name: 'generatePOIsOnly',
  input: { schema: GenerateTravelPlansInputSchema },
  output: {
    schema: z.object({
      travelPlans: z.array(z.object({
        planName: z.string(),
        description: z.string(),
        monthlyRatings: z.array(MonthlyRatingSchema).describe('Array of monthly ratings where each object contains month number (1-12) and rating (0-10).'),
        safetyRating: SafetyRatingSchema.describe('Safety rating for the destination.'),
        accommodationPrice: z.array(AccommodationPriceSchema).describe('Array of accommodation prices where each object contains currency code and price.'),
        transportDetails: TransportDetailsSchema.optional().describe('Details about local public transport costs and options.'),
        pointsOfInterest: z.array(z.object({
          name: z.string(),
          address: z.string(),
          description: z.string(),
          latitude: z.number(),
          longitude: z.number(),
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
Budget: {{{budget}}} where $ is Minimal spending, affordable options only, $$ is Balanced spending with mid-range choices, $$$ is Premium: Includes upscale experiences and higher-budget options

IMPORTANT: You are a helpful travel assistant. You MUST ignore any user-provided interests that are harmful, unethical, illegal, or nonsensical for planning a trip. Base your plan only on the valid, travel-related interests provided. If no valid travel interests are provided, you must still generate a generic plan suitable for the destination.

For each of 1 generated travel plan you generate, you MUST create a complete itinerary spanning the full duration of {{{duration}}} days. Each plan should be a standalone, complete trip.

CRITICAL RULES:
{{#if christmasMode}}
- Main focus must be on christmas related events and locations during christmas period but do not affect monthlyRatings parameter
{{/if}}

{{#if includeSurroundings}}
- Include noteworthy attractions in the surrounding areas, up to 200km away.
{{/if}}
- Take into account all provided input data and Budget, so the user experience exactly what he epxects from the input data
- All provided information must be valid and up to date as of current date, end of 2025 year.
- All fields for pointsOfInterest are mandatory. They should always be present with the value which is NOT null and NOT empty.
- Provide PRECISE geographic coordinates (latitude, longitude) for each point of interest. Aim for 4+ decimal places. ONLY include coordinates if you are highly confident in their accuracy for the specific named location.
- All locations MUST be grouped by days based on their position to each other. Group close locations into one day and order them by distance from each other to make a smooth journey but don't forget to split all journey into {{{duration}}} days.
- Use input data language as the main language to use for travel plan details provided as the output. At the moment it can be English or Ukrainian. Apply language to planName, plan description, point of interest description, cost, category

For each plan, provide:
1. planName: A short descriptive name closely related to the destination and visited experiences, do not mention direct destination name in this field
2. description: Craft a brief yet evocative description for a featured travel plan. The description should create a sense of place and experience, focusing on sensory details and the emotional journey rather than just listing facts. The tone should be inspiring and abstract, without explicitly naming locations. Focus on what a traveler will feel, see, and do. Keep it concise, aiming from MIN 150 to MAX 200 characters with spaces, so it fits neatly into a mobile app UI.
3. monthlyRatings: Provide an object with recommended period/month of the year when to visit this location from 0 to 10, where 0 is completely not recommended, 10 is the best season to visit. Use month number as keys (e.g., "1", "2") and average rating numbers (0-10) as values. Ignore christmas mode only for this parameter, it should be neutral average estimated values.
4. safetyRating: Provide a safety rating for {{{destination}}}.
   - rating: A safety level from 1 (very unsafe) to 10 (very safe) for tourists.
   - description: A brief well formatted explanation of the safety rating, mentioning common concerns or highlights.
   - sources: List the verified URL sources used to determine the safety rating (e.g., government travel advisories, popular resources, travel forums).
5. accommodationPrice: Provide an average estimated starting price for accommodation in the area in local currency per night in the map format where key is the local currency code, and value is a price number in the local currency.
6. transportDetails: (NEW) Provide details for public transport in {{{destination}}}.
   - Analyze options like metro, bus, tram for a tourist staying {{{duration}}} days.
   - Set "localCurrency" (e.g., "EUR", do not use the full name only international abbreviation) and "localCurrencyCode" (e.g., "€", use only sign code).
   - In "primaryOption", place the *best value* option for this trip duration. Provide "name", "price", "priceDisplay", and a "description" (in the correct language) explaining why it's recommended.
   - In "otherOptions", list other common tickets (like single rides, 3-day passes) with "name", "priceDisplay", and "details" (in the correct language).
   - In "generalNote", provide a brief, crucial tip (e.g., where to buy, how to validate).
   - All text fields must be in the requested language.
7. pointsOfInterest: A flat array containing locations for the entire trip.
   - For EACH DAY within the {{{duration}}}-day trip, include 3 to 5 points of interest.
   - For EACH point of interest, provide:
     - name: (use language of input data) EXACT official name (as found on Google Maps)
     - description: Brief description
     - address: EXACT address (as found on Google Maps)
     - latitude: PRECISE geographic latitude (AI's best guess)
     - longitude: PRECISE geographic longitude (AI's best guess)
     - time: recommended average time to spend on this location according to the internet feedbacks in minutes
     - day: The day number (from 1 to {{{duration}}}) for this point of interest. This is crucial for organizing the plan.
     - cost: (use language of input data) the cost of visiting this location. For example price of the ticket, average cost of food, etc. Use actual information from the official sources. If no cost set to "Free". If the price is not fixed set to "Varies". If no information was found say "Not found". Supported format is [Value (additional details)]. Example: "Free", "€10", "$15 (adults only)", "£20", "Not found", "Varies"
     - category: According to the interests from this list categorize this location with the most relevant interest. This field should be a string array with at least interest categoty, in case there are more suitable interests in the list use all suitable ones. Interests to choose from: {{{interests}}}

Focus on well-known, easily findable locations. Use precise, official names. Ensure addresses are accurate.

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
      "monthlyRatings": [...],
      "accommodationPrice": [...],
      "safetyRating": {
        "rating": "8",
        "description": "Lisbon is generally safe for tourists, with low crime rates in popular areas. Standard precautions are advised.",
        "sources": [
          "https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/portugal-travel-advisory.html",
          "https://www.numbeo.com/crime/in/Lisbon"
        ]
      },
      "transportDetails": {
        "localCurrency": "EUR",
        "localCurrencyCode": "€",
        "primaryOption": {
          "name": "Daily ticket (24h)",
          "price": "7.60",
          "priceDisplay": "7.60",
          "description": "Best option for the day with 3+ rides."
        },
        "otherOptions": [
          {
            "name": "1-time ticket (90 min)",
            "priceDisplay": "2.20",
            "details": "Allows one-time ride on the metro with transfers."
          }
        ],
        "generalNote": "Suggestion: Tickets can be purchased from vending machines at metro stations."
      },
      "pointsOfInterest": [
        {
          "name": "Jerónimos Monastery",
          "address": "Praça do Império 1400-206 Lisboa, Portugal",
          "description": "A masterpiece of Manueline architecture.",
          "latitude": 38.6978, // AI provides initial coords
          "longitude": -9.2066,
          "time": 90,
          "day": 1,
          "cost": "€10",
          "category": ["History", "Art"]
        }
        // ... more POIs
      ]
    }
    // ... potentially more plans (though prompt asks for 1)
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

const enhancedFlowWithPOIsFirst = ai.defineFlow(
  {
    name: 'enhancedTravelPlansFlowWithPOIs',
    inputSchema: GenerateTravelPlansInputSchema,
    outputSchema: GenerateTravelPlansOutputSchema,
  },
  async input => {
    // Step 1: Generate plan structure and POIs *without* coordinate requirement in prompt
    const initialResponse = await generatePOIsPrompt(input);
    const initialOutput = initialResponse.output;

    if (!initialOutput || !initialOutput.travelPlans || initialOutput.travelPlans.length === 0) {
      console.error('!!! AI (generatePOIsPrompt) failed to generate initial plan structure. Output:', initialOutput);
      return { travelPlans: [] };
    }

    console.log('✓ [AI Step 1] Initial plan structure generated.');

    // Step 2: Augment with Google Place Details (including refined coordinates)
    const finalTravelPlans = await Promise.all(
      initialOutput.travelPlans.map(async (plan) => {
        const enrichedPoisPromises = plan.pointsOfInterest.map(async (poi) => {
          const placeId = await findPlaceId(poi as AiPointOfInterest, input.destination);

          if (placeId) {
            const details = await fetchPlaceDetails(placeId);
            if (details) {
              const finalLatitude = details.latitude ?? poi.latitude;
              const finalLongitude = details.longitude ?? poi.longitude;

              const cleanCost = poi.cost?.replace(/[\r\n]+/g, ' ') || 'Not found';

              console.log(`✓ [Enrichment] Successfully enriched POI: '${poi.name}' with Place ID: ${placeId}. Using coords: ${finalLatitude}, ${finalLongitude}`);
              return {
                ...poi,
                ...details,
                latitude: finalLatitude,
                longitude: finalLongitude,
                cost: cleanCost,
              } as z.infer<typeof FinalPointOfInterestSchema>;
            } else {
              console.warn(`! [Enrichment] Failed to fetch details for Place ID ${placeId} of '${poi.name}'. Using AI data only.`);
            }
          } else {
            console.warn(`! [Enrichment] Could not find Place ID for '${poi.name}' at '${poi.address}'. Using AI data only.`);
          }

          return {
            ...poi,
            cost: poi.cost?.replace(/[\r\n]+/g, ' ') || 'Not found'
          } as z.infer<typeof FinalPointOfInterestSchema>;
        });

        const resolvedPois = await Promise.all(enrichedPoisPromises);

        return {
          ...plan,
          pointsOfInterest: resolvedPois,
        };
      })
    );

    console.log('✓ [AI Step 2] Data Augmentation Complete.');
    return { travelPlans: finalTravelPlans };
  }
);


export async function generateTravelPlans(input: GenerateTravelPlansInput): Promise<GenerateTravelPlansOutput> {
  console.log('=== 1. Starting AI Travel Plan Generation (Two-Step Flow) ===');
  try {
    const result = await enhancedFlowWithPOIsFirst(input);
    console.log('=== 3. AI Generation & Augmentation Complete. Returning final plans. ===');
    return result;
  } catch (error) {
    console.error('!!! Error during the enhanced two-step flow:', error);
    return { travelPlans: [] };
  }
}