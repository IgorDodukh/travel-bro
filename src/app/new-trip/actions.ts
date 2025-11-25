
'use server';

import { generateTravelPlans, type GenerateTravelPlansInput, type GenerateTravelPlansOutput } from '@/ai/flows/generate-travel-plans';
import { z } from 'zod';

const NewTripFormSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  budget: z.string().min(1, "Budget is required"),
  accommodation: z.string().min(1, "Accommodation type is required"),
  transport: z.string().min(1, "Transport type is required"),
  interests: z.array(z.string()).min(1, "At least one interest is required"),
  attractionType: z.string().min(1, "Attraction type is required"),
  includeSurroundings: z.boolean().optional(),
});

export type NewTripFormActionState = {
  message?: string;
  errors?: z.ZodError<GenerateTravelPlansInput>['formErrors']['fieldErrors'];
  data?: GenerateTravelPlansOutput;
  success: boolean;
  submittedInput?: GenerateTravelPlansInput; // Add the input to the state
};


export async function handleGeneratePlansAction(
  prevState: NewTripFormActionState | null,
  formData: FormData
): Promise<NewTripFormActionState> {
  try {
    const rawFormData = {
      destination: formData.get('destination') as string,
      duration: parseInt(formData.get('duration') as string, 10),
      budget: formData.get('budget') as string,
      accommodation: formData.get('accommodation') as string,
      transport: formData.get('transport') as string,
      interests: (formData.get('interests') as string)?.split(',').map(i => i.trim()).filter(i => i) || [],
      attractionType: formData.get('attractionType') as string,
      includeSurroundings: formData.get('includeSurroundings') === 'true',
    };

    const validatedFields = NewTripFormSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
      return {
        message: "Validation failed. Please check your inputs.",
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }

    const aiInput: GenerateTravelPlansInput = validatedFields.data;
    const generatedPlans = await generateTravelPlans(aiInput);

    if (!generatedPlans || !generatedPlans.travelPlans || generatedPlans.travelPlans.length === 0) {
      return { 
        message: "Could not generate travel plans. Please try adjusting your preferences.", 
        success: false,
        submittedInput: aiInput
      };
    }
    
    return { 
        message: "Travel plans generated successfully!", 
        data: generatedPlans, 
        success: true,
        submittedInput: aiInput
    };

  } catch (error) {
    console.error("Error generating travel plans:", error);
    let errorMessage = "An unexpected error occurred while generating travel plans.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { message: errorMessage, success: false };
  }
}
