
import { NextResponse } from 'next/server';
import { generateTravelPlans, type GenerateTravelPlansInput } from '@/ai/flows/generate-travel-plans';
import { z } from 'zod';

// Define the schema for the API input validation
const ApiInputSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  accommodation: z.string().min(1, "Accommodation type is required"),
  transport: z.string().min(1, "Transport type is required"),
  interests: z.array(z.string()).min(1, "At least one interest is required"),
  attractionType: z.string().min(1, "Attraction type is required"),
  includeSurroundings: z.boolean().optional(),
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
    const body = await request.json();
    const validationResult = ApiInputSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten().fieldErrors },
        { status: 400, headers: corsHeaders }
      );
    }

    const aiInput: GenerateTravelPlansInput = validationResult.data;
    const generatedPlans = await generateTravelPlans(aiInput);

    if (!generatedPlans || !generatedPlans.travelPlans || generatedPlans.travelPlans.length === 0) {
      return NextResponse.json(
        { error: 'Could not generate travel plans with the provided preferences.' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(generatedPlans, {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('[API /generate-plans] Error:', error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500, headers: corsHeaders });
  }
}
