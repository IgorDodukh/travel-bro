'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AiPointOfInterest } from './generate-travel-plans';

// ============================================================================
// SCHEMAS (Reusing from generate flow)
// ============================================================================

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
  monthlyRatings: z.array(MonthlyRatingSchema).optional().describe('Array of monthly ratings where each object contains month number (1-12) and rating (0-10).'),
  safetyRating: SafetyRatingSchema.optional().describe('Safety rating for the destination.'),
  accommodationPrice: z.array(AccommodationPriceSchema).optional().describe('Array of accommodation prices where each object contains currency code and price.'),
  transportDetails: TransportDetailsSchema.optional().describe('Details about local public transport costs and options.'),
  pointsOfInterest: z.array(FinalPointOfInterestSchema).describe('A list of points of interest with coordinates.'),
});

// ============================================================================
// UPDATE SCHEMAS
// ============================================================================

const ExistingPlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
  time: z.number(),
  day: z.number(),
  cost: z.string(),
  category: z.array(z.string()),
  rating: z.number().optional(),
  user_ratings_total: z.number().optional(),
  photos: z.array(z.string()).optional(),
  place_id: z.string().optional(),
  website: z.string().optional(),
  formatted_phone_number: z.string().optional(),
  types: z.array(z.string()).optional(),
});

const UpdateTravelPlanInputSchema = z.object({
  destination: z.string().describe('The destination of the travel plan.'),
  duration: z.number().describe('The duration of the trip in days.'),
  currentPlaces: z.array(ExistingPlaceSchema).describe('The current list of places in the travel plan.'),
  suggestionType: z.enum(['relaxed', 'packed', 'add', 'regenerate', 'custom']).describe('Type of update to perform.'),
  customRequest: z.string().optional().describe('Custom request for updates (required if suggestionType is custom).'),
  // Preserved data (not modified by AI)
  planName: z.string(),
  description: z.string(),
  monthlyRatings: z.array(MonthlyRatingSchema).optional(),
  safetyRating: SafetyRatingSchema.optional(),
  accommodationPrice: z.array(AccommodationPriceSchema).optional(),
  transportDetails: TransportDetailsSchema.optional(),
});

const UpdateTravelPlanOutputSchema = z.object({
  travelPlans: z.array(TravelPlanSchema).describe('Updated travel plan (single plan array for consistency).'),
  changesSummary: z.string().describe('Summary of changes made to the plan.'),
  updatedDuration: z.number().describe('The updated duration of the trip in days (may differ from original if days were added/removed).'),
});

export type UpdateTravelPlanInput = z.infer<typeof UpdateTravelPlanInputSchema>;
export type UpdateTravelPlanOutput = z.infer<typeof UpdateTravelPlanOutputSchema>;
export type ExistingPlace = z.infer<typeof ExistingPlaceSchema>;

const GOOGLE_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY!;

// ============================================================================
// GOOGLE PLACES UTILITIES (Same as generate flow)
// ============================================================================

const findPlaceId = async (poi: AiPointOfInterest, destination: string): Promise<string | null> => {
  // Strategy 1: Text search using Name, Address, and Destination
  try {
    const query = encodeURIComponent(`${poi.name}, ${poi.address}, ${destination}`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}`;
    console.log(`[Update - Place ID - Strategy 1] Searching Text: "${poi.name}, ${poi.address}, ${destination}"`);
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].place_id;
    } else {
      console.log(`[Update - Place ID - Strategy 1] Text search failed for '${poi.name}'. Status: ${data.status}`);
    }
  } catch (error) {
    console.error(`[Update - Place ID - Strategy 1] Error for ${poi.name}:`, error);
  }

  // Strategy 2: Text search using only Name and Destination
  try {
    const query = encodeURIComponent(`${poi.name}, ${destination}`);
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}`;
    console.log(`[Update - Place ID - Strategy 2] Searching Text: "${poi.name}, ${destination}"`);
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].place_id;
    } else {
      console.log(`[Update - Place ID - Strategy 2] Text search failed for '${poi.name}'. Status: ${data.status}`);
    }
  } catch (error) {
    console.error(`[Update - Place ID - Strategy 2] Error for ${poi.name}:`, error);
  }

  // Strategy 3: Nearby search using coordinates
  try {
    const radius = 500;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${poi.latitude},${poi.longitude}&radius=${radius}&keyword=${encodeURIComponent(poi.name)}&key=${GOOGLE_API_KEY}`;
    console.log(`[Update - Place ID - Strategy 3] Searching Nearby ${poi.latitude},${poi.longitude}`);
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].place_id;
    } else {
      console.log(`[Update - Place ID - Strategy 3] Nearby search failed for '${poi.name}'. Status: ${data.status}`);
    }
  } catch (error) {
    console.error(`[Update - Place ID - Strategy 3] Error for ${poi.name}:`, error);
  }

  console.error(`✗ [Update - Place ID] Could NOT find Place ID for '${poi.name}'. Returning null.`);
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
        console.warn(`[Update - Details] Missing geometry for Place ID ${placeId}`);
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
      console.error(`[Update - Details] Failed for Place ID ${placeId}. Status: ${data.status}`);
    }
    return null;
  } catch (error) {
    console.error(`[Update - Details] Error for Place ID ${placeId}:`, error);
    return null;
  }
};

// ============================================================================
// VALIDATION & SECURITY
// ============================================================================

function validateAndSanitizeCustomRequest(customRequest: string): void {
  const lowerRequest = customRequest.toLowerCase();

  // Harmful patterns check
  const harmfulPatterns = [
    /ignore.*previous.*instructions?/i,
    /disregard.*rules?/i,
    /bypass.*restrictions?/i,
    /you\s+are\s+now/i,
    /new\s+instructions?/i,
    /system\s+prompt/i,
    /developer\s+mode/i,
    /jailbreak/i,
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(lowerRequest)) {
      throw new Error('Invalid custom request: contains potentially harmful content');
    }
  }

  // Travel-related keywords check
  const travelKeywords = [
    'place', 'location', 'destination', 'itinerary', 'visit', 'explore',
    'day', 'schedule', 'time', 'activity', 'attraction', 'restaurant',
    'hotel', 'transport', 'travel', 'trip', 'journey', 'tour', 'sightseeing',
    'beach', 'museum', 'park', 'hike', 'nightlife', 'food', 'culture',
    'add', 'remove', 'replace', 'more', 'less', 'change', 'update'
  ];

  const hasTravelKeyword = travelKeywords.some(keyword => lowerRequest.includes(keyword));

  if (!hasTravelKeyword) {
    throw new Error('Custom request must be travel-related');
  }
}

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

function buildCurrentItineraryContext(places: ExistingPlace[], duration: number): string {
  const placesByDay: { [day: number]: ExistingPlace[] } = {};

  places.forEach(place => {
    if (!placesByDay[place.day]) {
      placesByDay[place.day] = [];
    }
    placesByDay[place.day].push(place);
  });

  let context = 'CURRENT ITINERARY:\n\n';

  for (let day = 1; day <= duration; day++) {
    const dayPlaces = placesByDay[day] || [];
    const totalMinutes = dayPlaces.reduce((sum, p) => sum + p.time, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    context += `Day ${day} (${dayPlaces.length} places, ~${hours}h ${minutes}m total):\n`;

    dayPlaces.forEach((place, idx) => {
      context += `  ${idx + 1}. ${place.name}\n`;
      context += `     - Categories: ${place.category.join(', ')}\n`;
      context += `     - Time: ${place.time} minutes\n`;
      context += `     - Rating: ${place.rating || 'N/A'}/5.0\n`;
      context += `     - Cost: ${place.cost}\n`;
      context += `     - Description: ${place.description || 'No description'}\n`;
      context += `     - Address: ${place.address}\n\n`;
    });
  }

  return context;
}

function getRelaxedPromptInstructions(places: ExistingPlace[], duration: number): string {
  const avgPerDay = (places.length / duration).toFixed(1);

  return `
TASK: CREATE A MORE RELAXED ITINERARY

Current Status:
- Total places: ${places.length}
- Average per day: ${avgPerDay}
- Duration: ${duration} days

Your goal is to make this travel plan less busy and more enjoyable:

1. REDUCE NUMBER OF PLACES:
   - Aim for 2-4 high-quality places per day MAXIMUM
   - Keep only the most exciting and worthwhile locations
   - Prioritize places with ratings of 4.5+ and high review counts
   - Remove redundant or less interesting locations

2. SELECTION CRITERIA (priority order):
   - Rating and popularity (higher = keep)
   - Uniqueness (one-of-a-kind experiences over generic)
   - Category diversity (varied experiences)
   - Geographical clustering (reduce travel time)
   - Time allocation (120+ minutes often more significant)

3. MAINTAIN BALANCE:
   - Good mix of activities each day
   - Don't over-concentrate categories on one day
   - Leave breathing room (4-6 hours of activities per day)
   - Consider meal times and rest

4. CATEGORY GUIDELINES:
   - Nightlife: Maximum 1 per day, at the end
   - Hiking: Keep most scenic/highest rated, limit 1 per day
   - Beaches: Keep only the best-rated one if multiple exist
   - Museums/Cultural: Maximum 2 per day

5. PRESERVE:
   - Geographical flow (no zigzag patterns)
   - Day assignments unless optimization requires change
   - DURATION: Keep updatedDuration as ${duration} (no days added or removed)
`;
}

function getPackedPromptInstructions(places: ExistingPlace[], duration: number): string {
  const avgPerDay = (places.length / duration).toFixed(1);

  return `
TASK: CREATE A MORE PACKED ITINERARY

Current Status:
- Total places: ${places.length}
- Average per day: ${avgPerDay}
- Duration: ${duration} days

Your goal is to maximize quality experiences:

1. ADD MORE PLACES:
   - Identify gaps in the schedule
   - Aim for 5-8 places per day (but keep it realistic)
   - Look for highly-rated places near existing locations
   - Consider quick-visit places (30-60 minutes)

2. ROUTE OPTIMIZATION:
   - Current places are grouped by day with optimal routing
   - Add places that fit the geographical flow
   - Add places between existing locations or nearby
   - Avoid backtracking or inefficient travel

3. QUALITY OVER QUANTITY:
   - Only add places with ratings 4.0+
   - Prioritize places with 100+ reviews
   - Don't add low-quality places just to increase count

4. ADDITIONS TO CONSIDER:
   - Local food markets/food halls (30-60 min)
   - Scenic viewpoints (15-30 min)
   - Historic neighborhoods for walking (60-90 min)
   - Local cafes for breaks
   - Shopping districts if not covered
   - Lesser-known gems near major attractions

5. TIME MANAGEMENT:
   - Daily schedules: 8-12 hours of activities
   - Account for travel time between locations
   - Morning: outdoor/active places
   - Afternoon: indoor/relaxed activities
   - Evening: dining and nightlife

6. PRESERVE:
   - DURATION: Keep updatedDuration as ${duration} (no days added or removed)
`;
}

function getAddPromptInstructions(places: ExistingPlace[], duration: number): string {
  const newDuration = duration + 1;

  return `
TASK: ADD ONE MORE DAY TO THE ITINERARY

Current Status:
- Total places: ${places.length}
- Current duration: ${duration} days
- NEW duration will be: ${newDuration} days (you are adding 1 day)
- Average per day: ${(places.length / duration).toFixed(1)}
- Existing places: ${places.map(p => p.name).join(', ')}

Your goal is to add an additional day of high-quality experiences:

1. ADD A NEW DAY:
    - Create a new Day ${newDuration} with 4-6 places
    - **CRITICAL**: Set updatedDuration to ${newDuration} in your response
    - All new places must have day: ${newDuration}
    - Focus on a specific theme or category for the new day (e.g., local culture, nature, food)
    - Add places that are not already in the itinerary and provide a unique experience
    
2. KEEP EXISTING PLACES:
    - Include ALL existing places from days 1-${duration} with their original day numbers
    - Do NOT modify existing places unless absolutely necessary
    
3. SELECTION CRITERIA:
    - Prioritize places with ratings of 4.5+ and high review counts
    - Look for hidden gems or lesser-known attractions that offer authentic local experiences
    - Consider places that complement the existing itinerary but add new dimensions
    
4. MAINTAIN QUALITY:
    - Ensure each place has a clear reason for inclusion
    - Provide a brief description for each new place added
    
5. GEOGRAPHICAL CONSIDERATIONS:
    - If possible, cluster new places geographically to create a cohesive day
    - Consider adding a new area of the city or region not covered in existing days
    
6. BALANCE:
    - Ensure the new day offers a good mix of activities (sightseeing, dining, relaxation)
    
7. QUALITY BENCHMARKS:
   - Every new added place should have a "wow" factor
   - Target average rating of 4.5+
   - Each place memorable and photogenic

**MANDATORY**: Your response MUST include updatedDuration: ${newDuration}
`;
}

function getRegeneratePromptInstructions(places: ExistingPlace[], duration: number): string {
  const categories = [...new Set(places.flatMap(p => p.category))];
  const avgRating = places.reduce((sum, p) => sum + (p.rating || 0), 0) / places.length;

  return `
TASK: REGENERATE WITH MORE INTERESTING AND UNIQUE LOCATIONS

Current Plan Analysis:
- Total places: ${places.length}
- Categories: ${categories.join(', ')}
- Average rating: ${avgRating.toFixed(1)}/5.0
- Duration: ${duration} days

Your mission as a professional travel insider:

1. ANALYZE CURRENT PREFERENCES:
   - Identify travel interests shown in current selection
   - Understand the vibe (adventure/culture/relaxation)
   - Note the category distribution but avoid using "custom" category for new places, keep it for existing places only
   - Look for patterns in types of places chosen (e.g., many museums, few outdoor spots)

2. FIND BETTER ALTERNATIVES:
   - Think like a local insider, not a guidebook
   - Find MORE INTERESTING and MORE UNIQUE alternatives
   - Prioritize authenticity and memorable experiences

3. REPLACEMENT CRITERIA:
   - Replace generic/touristy → hidden gems
   - Replace overcrowded → equally impressive but less-known
   - Find unique local experiences
   - Seek places with exceptional ratings (4.6+)
   - Consider seasonal specialties and local favorites

4. WHAT MAKES A PLACE "MORE INTERESTING":
   - Unique to this destination (can't find elsewhere)
   - Authentic local experience (not tourist-trap)
   - Compelling story or historical significance
   - Unusual perspective or experience
   - Highly praised by locals and experienced travelers
   - Off-the-beaten-path but accessible
   - Immersive cultural or natural experience

5. SPECIFIC IMPROVEMENTS:
   - Standard beaches → secluded coves or unique coastal features
   - Touristy restaurants → authentic local eateries
   - Generic museums → specialized or interactive museums
   - Common viewpoints → lesser-known panoramic spots
   - Standard parks → nature reserves or unique landscapes
   - Typical nightlife → unique local evening experiences

6. QUALITY BENCHMARKS:
   - Every place should have a "wow" factor
   - Target average rating of 4.6+
   - Each place memorable and photogenic
   - Prioritize experiences over generic sightseeing

7. PRESERVE:
   - DURATION: Keep updatedDuration as ${duration} (no days added or removed)
`;
}

function getCustomPromptInstructions(customRequest: string, places: ExistingPlace[], duration: number): string {
  // Check if custom request mentions changing number of days
  const lowerRequest = customRequest.toLowerCase();
  const mentionsAddingDays = lowerRequest.includes('add') && (lowerRequest.includes('day') || lowerRequest.includes('days'));
  const mentionsRemovingDays = (lowerRequest.includes('remove') || lowerRequest.includes('reduce') || lowerRequest.includes('delete')) && (lowerRequest.includes('day') || lowerRequest.includes('days'));

  let durationGuidance = `- DURATION: Keep updatedDuration as ${duration} unless the request specifically asks to change it`;

  if (mentionsAddingDays) {
    durationGuidance = `- DURATION: The user wants to add days. Analyze how many days to add based on their request, then set updatedDuration accordingly (e.g., if adding 1 day: ${duration + 1}, if adding 2 days: ${duration + 2})`;
  } else if (mentionsRemovingDays) {
    durationGuidance = `- DURATION: The user wants to remove/reduce days. Analyze how many days to remove based on their request, then set updatedDuration accordingly. Minimum duration is 1 day.`;
  }

  return `
TASK: UPDATE TRAVEL PLAN BASED ON CUSTOM REQUEST

User's Request:
"${customRequest}"

Current Plan:
- Total places: ${places.length}
- Current duration: ${duration} days
- Categories: ${[...new Set(places.flatMap(p => p.category))].join(', ')}

Instructions:

1. ANALYZE THE REQUEST:
   - Understand what the user wants
   - Identify specific changes: places, categories, schedule, pace, theme, or **duration**
   - Determine if request affects specific days or overall plan
   - Pay special attention to requests about adding or removing days
   - Do only what is requested, but do it well

2. IMPLEMENT THOUGHTFULLY:
   - Make changes that directly address the request
   - Maintain quality and coherence
   - Don't make unrequested changes
   - Interpret vague requests logically

3. COMMON REQUEST TYPES:
   - "Add more [category]" → Include additional places in that category into existing days, do NOT create new days unless explicitly asked
   - "Remove/reduce [category]" → Filter out or minimize
   - "Add a day" / "Add another day" → Increase duration by 1, create new day with 4-6 places
   - "Add [N] days" → Increase duration by N, create new days with places
   - "Remove day [N]" / "Make it shorter" → Decrease duration, remove or consolidate places
   - "Focus on [theme]" → Restructure to emphasize theme
   - "Make day X more [adjective]" → Adjust that specific day
   - "Add place [name]" → Research and add if suitable
   - "More time at [place]" → Increase time allocation
   - "Faster/slower pace" → Adjust places per day
   - "More budget-friendly" → Replace with free/cheap alternatives
   - "More luxury" → Upgrade to higher-end experiences
   - "Family-friendly" → Ensure appropriate for children
   - "Romantic" → Focus on couples experiences
   - "Adventurous" → Emphasize outdoor/active

4. DURATION HANDLING:
   ${durationGuidance}
   - If adding days: Create new day(s) with 4-6 quality places each
   - If removing days: Consolidate best places into remaining days
   - Always ensure updatedDuration reflects the final number of days

5. MAINTAIN INTEGRITY:
   - Don't remove essentials unless requested
   - Keep geographical flow logical
   - Ensure realistic daily schedules
   - Maintain category diversity unless specified

6. RESPONSE:
   - Address the request directly
   - Make targeted changes, not wholesale replacement
   - Ensure updatedDuration is correct
   - Suggest complementary improvements if they enhance the request
`;
}

// ============================================================================
// AI PROMPT DEFINITION
// ============================================================================

const updatePOIsPrompt = ai.definePrompt({
  name: 'updatePOIsOnly',
  input: { schema: UpdateTravelPlanInputSchema },
  output: {
    schema: z.object({
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
      })),
      changesSummary: z.string().describe('Brief summary of what was changed and why (2-4 sentences)'),
      updatedDuration: z.number().describe('The total number of days in the updated itinerary. Count the HIGHEST day number from all places. If you added/removed days, this MUST reflect the new total.'),
    })
  },
  prompt: `You are an experienced travel planning assistant updating an existing travel itinerary.

DESTINATION: {{{destination}}}
CURRENT DURATION: {{{duration}}} days
SUGGESTION TYPE: {{{suggestionType}}}

{{{currentItineraryContext}}}

{{{specificInstructions}}}

CRITICAL RULES:
- All provided information must be valid and up to date as of end of 2025.
- All fields for pointsOfInterest are MANDATORY (never null or empty).
- Provide PRECISE geographic coordinates (latitude, longitude) with 4+ decimal places.
- All locations MUST be grouped by days based on proximity to each other.
- Group close locations into one day and order by distance for smooth journey.
- For EACH point of interest, provide:
  - name: EXACT official name (as found on Google Maps)
  - address: EXACT address (as found on Google Maps)
  - description: Brief description explaining why worth visiting
  - latitude: PRECISE latitude (AI's best estimate)
  - longitude: PRECISE longitude (AI's best estimate)
  - time: Recommended time to spend (minutes)
  - day: Day number (starting from 1)
  - cost: Actual cost from official sources. Format: "Free", "€10", "$15 (adults)", "Varies", "Not found"
  - category: Array of relevant categories but avoid using "custom" for new locations, keep it for existing locations. Use specific categories like "Museum", "Beach", "Hiking", "Nightlife", etc.

CATEGORIES TO USE: {{{availableCategories}}}

**CRITICAL - updatedDuration FIELD**:
- Set updatedDuration to the TOTAL number of days in your final itinerary
- This is the HIGHEST day number from all your places
- If you added a day: updatedDuration = {{{duration}}} + 1
- If you removed a day: updatedDuration = {{{duration}}} - 1
- If no days changed: updatedDuration = {{{duration}}}

Return ONLY a valid JSON object with:
- pointsOfInterest: Array of updated places
- changesSummary: Brief explanation of changes (2-4 sentences). If duration changed, mention it explicitly.
- updatedDuration: The TOTAL number of days (MANDATORY - must be accurate)

Example for adding a day:
\`\`\`json
{
  "pointsOfInterest": [
    {
      "name": "Existing Place",
      "address": "...",
      "description": "...",
      "latitude": 38.6978,
      "longitude": -9.2066,
      "time": 90,
      "day": 1,
      "cost": "€10",
      "category": ["History"]
    },
    {
      "name": "New Day Place",
      "address": "...",
      "description": "...",
      "latitude": 38.7123,
      "longitude": -9.1389,
      "time": 120,
      "day": 3,
      "cost": "Free",
      "category": ["Nature"]
    }
  ],
  "changesSummary": "Added a new day (Day 3) with 5 nature-focused activities. Kept all existing places from Days 1-2. Total duration increased from 2 to 3 days.",
  "updatedDuration": 3
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

// ============================================================================
// UPDATE FLOW
// ============================================================================

const updateTravelPlanFlow = ai.defineFlow(
  {
    name: 'updateTravelPlanFlow',
    inputSchema: UpdateTravelPlanInputSchema,
    outputSchema: UpdateTravelPlanOutputSchema,
  },
  async input => {
    console.log('=== 1. Starting Travel Plan Update (Two-Step Flow) ===');
    console.log(`Suggestion Type: ${input.suggestionType}`);
    console.log(`Current places: ${input.currentPlaces.length}`);
    console.log(`Current duration: ${input.duration} days`);

    // Validate custom request if present
    if (input.suggestionType === 'custom') {
      if (!input.customRequest) {
        throw new Error('customRequest is required when suggestionType is "custom"');
      }
      validateAndSanitizeCustomRequest(input.customRequest);
    }

    // Build context
    const currentItineraryContext = buildCurrentItineraryContext(input.currentPlaces, input.duration);
    const availableCategories = [...new Set(input.currentPlaces.flatMap(p => p.category))].join(', ');

    // Get specific instructions based on suggestion type
    let specificInstructions = '';
    switch (input.suggestionType) {
      case 'relaxed':
        specificInstructions = getRelaxedPromptInstructions(input.currentPlaces, input.duration);
        break;
      case 'packed':
        specificInstructions = getPackedPromptInstructions(input.currentPlaces, input.duration);
        break;
      case 'add':
        specificInstructions = getAddPromptInstructions(input.currentPlaces, input.duration);
        break;
      case 'regenerate':
        specificInstructions = getRegeneratePromptInstructions(input.currentPlaces, input.duration);
        break;
      case 'custom':
        specificInstructions = getCustomPromptInstructions(input.customRequest!, input.currentPlaces, input.duration);
        break;
    }

    // Prepare prompt input
    const promptInput = {
      ...input,
      currentItineraryContext,
      specificInstructions,
      availableCategories,
    };

    // Step 1: Generate updated POIs
    console.log('=== 2. Generating updated POIs with AI ===');
    const initialResponse = await updatePOIsPrompt(promptInput);
    const initialOutput = initialResponse.output;

    if (!initialOutput || !initialOutput.pointsOfInterest || initialOutput.pointsOfInterest.length === 0) {
      console.error('!!! AI failed to generate updated POIs. Output:', initialOutput);
      throw new Error('Failed to generate updated travel plan');
    }

    console.log(`✓ AI generated ${initialOutput.pointsOfInterest.length} updated POIs`);
    console.log(`✓ AI reported updatedDuration: ${initialOutput.updatedDuration}`);

    // Validate and correct updatedDuration if necessary
    const maxDay = Math.max(...initialOutput.pointsOfInterest.map(p => p.day));
    const finalDuration = initialOutput.updatedDuration || maxDay;

    if (finalDuration !== initialOutput.updatedDuration) {
      console.warn(`! Correcting duration from ${initialOutput.updatedDuration} to ${finalDuration} based on max day number`);
    }

    console.log(`✓ Final duration: ${finalDuration} days`);

    // Step 2: Enrich with Google Place Details
    console.log('=== 3. Enriching POIs with Google Place Details ===');
    const enrichedPoisPromises = initialOutput.pointsOfInterest.map(async (poi) => {
      const placeId = await findPlaceId(poi as AiPointOfInterest, input.destination);

      if (placeId) {
        const details = await fetchPlaceDetails(placeId);
        if (details) {
          const finalLatitude = details.latitude ?? poi.latitude;
          const finalLongitude = details.longitude ?? poi.longitude;
          const cleanCost = poi.cost?.replace(/[\r\n]+/g, ' ') || 'Not found';

          console.log(`✓ Enriched POI: '${poi.name}' with Place ID: ${placeId}`);
          return {
            ...poi,
            ...details,
            latitude: finalLatitude,
            longitude: finalLongitude,
            cost: cleanCost,
          } as z.infer<typeof FinalPointOfInterestSchema>;
        } else {
          console.warn(`! Failed to fetch details for '${poi.name}'. Using AI data only.`);
        }
      } else {
        console.warn(`! Could not find Place ID for '${poi.name}'. Using AI data only.`);
      }

      return {
        ...poi,
        cost: poi.cost?.replace(/[\r\n]+/g, ' ') || 'Not found'
      } as z.infer<typeof FinalPointOfInterestSchema>;
    });

    const enrichedPois = await Promise.all(enrichedPoisPromises);

    // Step 3: Assemble final response (maintaining same structure as generate flow)
    const updatedPlan = {
      planName: input.planName,
      description: input.description,
      monthlyRatings: input.monthlyRatings,
      safetyRating: input.safetyRating,
      accommodationPrice: input.accommodationPrice,
      transportDetails: input.transportDetails,
      pointsOfInterest: enrichedPois,
    };

    console.log('=== 4. Update Complete ===');
    console.log(`Original duration: ${input.duration} days`);
    console.log(`Updated duration: ${finalDuration} days`);
    console.log(`Final POIs count: ${enrichedPois.length}`);
    console.log(`Changes: ${initialOutput.changesSummary}`);

    return {
      travelPlans: [updatedPlan], // Single plan in array for consistency with generate flow
      changesSummary: initialOutput.changesSummary,
      updatedDuration: finalDuration,
    };
  }
);

// ============================================================================
// PUBLIC API
// ============================================================================

export async function updateTravelPlan(input: UpdateTravelPlanInput): Promise<UpdateTravelPlanOutput> {
  console.log('=== Starting Travel Plan Update ===');
  console.log(`Destination: ${input.destination}`);
  console.log(`Type: ${input.suggestionType}`);
  console.log(`Current duration: ${input.duration} days`);

  try {
    const result = await updateTravelPlanFlow(input);
    console.log('=== Travel Plan Update Complete ===');
    console.log(`New duration: ${result.updatedDuration} days`);
    return result;
  } catch (error) {
    console.error('!!! Error during travel plan update:', error);
    throw error;
  }
}