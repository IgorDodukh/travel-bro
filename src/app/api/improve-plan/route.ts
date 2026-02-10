import { updateTravelPlan, UpdateTravelPlanInput } from '@/ai/flows/improve-travel-plan';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define schemas for validation based on the actual data structure
const PlaceSchema = z.object({
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
  planId: z.string().optional(),
  updatedAt: z.any().optional(), // Firestore timestamp
});

const MonthlyRatingSchema = z.object({
  month: z.string(),
  rating: z.number(),
});

const SafetyRatingSchema = z.object({
  rating: z.string(),
  description: z.string(),
  sources: z.array(z.string()),
});

const AccommodationPriceSchema = z.object({
  currency: z.string(),
  price: z.number(),
});

const TransportOptionSchema = z.object({
  name: z.string(),
  priceDisplay: z.string(),
  details: z.string(),
});

const PrimaryTransportOptionSchema = z.object({
  name: z.string(),
  price: z.string(),
  priceDisplay: z.string(),
  description: z.string(),
});

const TransportDetailsSchema = z.object({
  localCurrency: z.string(),
  localCurrencyCode: z.string(),
  primaryOption: PrimaryTransportOptionSchema,
  otherOptions: z.array(TransportOptionSchema),
  generalNote: z.string(),
});

const PlanSchema = z.object({
  id: z.string(),
  userId: z.string(),
  destination: z.string().min(1, "Destination is required"),
  duration: z.number().min(1, "Duration must be at least 1 day").max(30, "Duration cannot exceed 30 days"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  highlights: z.array(z.string()).optional(),
  monthlyRatings: z.array(MonthlyRatingSchema).optional(),
  safetyRating: SafetyRatingSchema.optional(),
  accommodationPrice: z.array(AccommodationPriceSchema).optional(),
  transportDetails: TransportDetailsSchema.optional(),
  places: z.array(z.string()), // Array of place IDs
  imageUrl: z.string().optional(),
  isSaved: z.boolean().optional(),
  savedAt: z.string().optional(),
  savedTimestamp: z.number().optional(),
  shareToken: z.string().optional(),
  createdAt: z.any().optional(), // Firestore timestamp
  updatedAt: z.any().optional(), // Firestore timestamp
  isSharedCopy: z.boolean().optional(),
});

// Define the schema for the API input validation
const ApiInputSchema = z.object({
  plan: PlanSchema,
  places: z.array(PlaceSchema).min(1, "At least one place is required"),
  suggestionType: z.enum(['relaxed', 'packed', 'regenerate', 'add', 'custom'], {
    errorMap: () => ({ message: "Suggestion type must be one of: relaxed, packed, regenerate, add or custom" })
  }),
  customRequest: z.string().optional(),
}).superRefine((data, ctx) => {
  // Custom validation: if suggestionType is 'custom', customRequest is required
  if (data.suggestionType === 'custom' && (!data.customRequest || data.customRequest.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "customRequest is required when suggestionType is 'custom'",
      path: ['customRequest'],
    });
  }

  // Validate that all places have valid day numbers
  const invalidDayPlaces = data.places.filter(p => p.day < 1 || p.day > data.plan.duration);
  if (invalidDayPlaces.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Some places have invalid day numbers. All days must be between 1 and ${data.plan.duration}`,
      path: ['places'],
    });
  }

  // Validate custom request content if provided
  if (data.customRequest) {
    const lowerRequest = data.customRequest.toLowerCase();

    // Check for harmful patterns
    const harmfulPatterns = [
      /ignore.*previous.*instructions?/i,
      /disregard.*rules?/i,
      /bypass.*restrictions?/i,
      /you\s+are\s+now/i,
      /new\s+instructions?/i,
      /system\s+prompt/i,
      /developer\s+mode/i,
      /jailbreak/i,
      /prompt\s+injection/i,
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(lowerRequest)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid custom request: contains potentially harmful content",
          path: ['customRequest'],
        });
        break;
      }
    }

    // Validate that custom request is travel-related
    const travelKeywords = [
      'place', 'location', 'destination', 'itinerary', 'visit', 'explore',
      'day', 'schedule', 'time', 'activity', 'attraction', 'restaurant',
      'hotel', 'transport', 'travel', 'trip', 'journey', 'tour', 'sightseeing',
      'beach', 'museum', 'park', 'hike', 'nightlife', 'food', 'culture',
      'add', 'remove', 'replace', 'more', 'less', 'change', 'update', 'modify'
    ];

    const hasTravelKeyword = travelKeywords.some(keyword => lowerRequest.includes(keyword));

    if (!hasTravelKeyword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Custom request must be travel-related. Please include travel-specific terms.",
        path: ['customRequest'],
      });
    }
  }

  // Validate that places array matches plan.places IDs
  const placeIds = new Set(data.places.map(p => p.id));
  const planPlaceIds = new Set(data.plan.places);

  // Check if there are missing places
  const missingPlaces = data.plan.places.filter(id => !placeIds.has(id));
  if (missingPlaces.length > 0) {
    console.warn(`[API /update-plan] Warning: Plan references ${missingPlaces.length} place(s) not in places array`);
  }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow any origin
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    console.log('[API /update-plan] Received request');
    console.log('[API /update-plan] Plan ID:', body.plan?.id);
    console.log('[API /update-plan] Destination:', body.plan?.destination);
    console.log('[API /update-plan] Duration:', body.plan?.duration);
    console.log('[API /update-plan] Suggestion Type:', body.suggestionType);
    console.log('[API /update-plan] Places count:', body.places?.length);

    if (body.customRequest) {
      console.log('[API /update-plan] Custom Request:', body.customRequest);
    }

    // Validate input
    const validationResult = ApiInputSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      console.error('[API /update-plan] Validation failed:', errors);

      return NextResponse.json(
        {
          error: 'Invalid input',
          details: errors,
          message: 'Please check your input and try again.'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { plan, places, suggestionType, customRequest } = validationResult.data;

    // Additional runtime validations
    if (places.length === 0) {
      return NextResponse.json(
        {
          error: 'No places to update',
          message: 'The travel plan must have at least one place to update.'
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate that each day has at least one place
    const placesByDay = new Map<number, number>();
    places.forEach(place => {
      placesByDay.set(place.day, (placesByDay.get(place.day) || 0) + 1);
    });

    for (let day = 1; day <= plan.duration; day++) {
      if (!placesByDay.has(day)) {
        console.warn(`[API /update-plan] Warning: Day ${day} has no places`);
      }
    }

    // Transform to UpdateTravelPlanInput format
    const aiInput: UpdateTravelPlanInput = {
      destination: plan.destination,
      duration: plan.duration,
      currentPlaces: places.map(place => ({
        id: place.id,
        name: place.name,
        description: place.description || '',
        latitude: place.latitude,
        longitude: place.longitude,
        address: place.address,
        time: place.time,
        day: place.day,
        cost: place.cost,
        category: place.category,
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        photos: place.photos,
        place_id: place.place_id,
        website: place.website,
        formatted_phone_number: place.formatted_phone_number,
        types: place.types,
      })),
      suggestionType,
      customRequest,
      planName: plan.title,
      description: plan.description,
      monthlyRatings: plan.monthlyRatings,
      safetyRating: plan.safetyRating,
      accommodationPrice: plan.accommodationPrice,
      transportDetails: plan.transportDetails,
    };

    console.log('[API /update-plan] Validation passed. Calling AI update flow...');

    // Call the AI update flow
    const updatedPlan = await updateTravelPlan(aiInput);

    console.log('[API /update-plan] AI update complete');
    console.log('[API /update-plan] Updated POIs count:', updatedPlan.travelPlans[0]?.pointsOfInterest?.length);
    console.log('[API /update-plan] Original duration:', plan.duration, 'days');
    console.log('[API /update-plan] Updated duration:', updatedPlan.updatedDuration, 'days');
    if (updatedPlan.updatedDuration !== plan.duration) {
      console.log('[API /update-plan] ⚠️  DURATION CHANGED:', plan.duration, '→', updatedPlan.updatedDuration, 'days');
    }
    console.log('[API /update-plan] Changes summary:', updatedPlan.changesSummary);

    // Validate response
    if (!updatedPlan || !updatedPlan.travelPlans || updatedPlan.travelPlans.length === 0) {
      console.error('[API /update-plan] AI returned empty or invalid response');
      return NextResponse.json(
        {
          error: 'Could not update travel plan',
          message: 'The AI service failed to generate an updated plan. Please try again.'
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const updatedTravelPlan = updatedPlan.travelPlans[0];

    // Validate updated plan has points of interest
    if (!updatedTravelPlan.pointsOfInterest || updatedTravelPlan.pointsOfInterest.length === 0) {
      console.error('[API /update-plan] Updated plan has no points of interest');
      return NextResponse.json(
        {
          error: 'Invalid updated plan',
          message: 'The updated plan contains no places. Please try again with different parameters.'
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Validate all days are covered
    const updatedPlacesByDay = new Map<number, number>();
    updatedTravelPlan.pointsOfInterest.forEach(place => {
      updatedPlacesByDay.set(place.day, (updatedPlacesByDay.get(place.day) || 0) + 1);
    });

    const missingDays = [];
    for (let day = 1; day <= plan.duration; day++) {
      if (!updatedPlacesByDay.has(day) || updatedPlacesByDay.get(day) === 0) {
        missingDays.push(day);
      }
    }

    if (missingDays.length > 0) {
      console.warn(`[API /update-plan] Warning: Days ${missingDays.join(', ')} have no places after update`);
    }

    // Log statistics
    console.log('[API /update-plan] Update statistics:');
    console.log('  - Original places:', places.length);
    console.log('  - Updated places:', updatedTravelPlan.pointsOfInterest.length);
    console.log('  - Difference:', updatedTravelPlan.pointsOfInterest.length - places.length);
    console.log('  - Days covered:', updatedPlacesByDay.size, '/', plan.duration);

    // Return successful response in the same format as generate-plans
    return NextResponse.json(
      {
        travelPlans: updatedPlan.travelPlans,
        changesSummary: updatedPlan.changesSummary,
        updatedDuration: updatedPlan.updatedDuration,
        metadata: {
          planId: plan.id,
          originalPlacesCount: places.length,
          updatedPlacesCount: updatedTravelPlan.pointsOfInterest.length,
          originalDuration: plan.duration,
          updatedDuration: updatedPlan.updatedDuration,
          durationChanged: updatedPlan.updatedDuration !== plan.duration,
          suggestionType: suggestionType,
          timestamp: new Date().toISOString(),
        }
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('[API /update-plan] Error:', error);

    let errorMessage = "An unexpected error occurred while updating the travel plan.";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific error types
      if (error.message.includes('Invalid custom request')) {
        statusCode = 400;
      } else if (error.message.includes('API key') || error.message.includes('authentication')) {
        errorMessage = "Service configuration error. Please contact support.";
        statusCode = 503;
      } else if (error.message.includes('rate limit')) {
        errorMessage = "Service is temporarily busy. Please try again in a moment.";
        statusCode = 429;
      } else if (error.message.includes('timeout')) {
        errorMessage = "Request timed out. Please try again with fewer places.";
        statusCode = 504;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      },
      { status: statusCode, headers: corsHeaders }
    );
  }
}