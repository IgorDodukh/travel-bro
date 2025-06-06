'use server';

/**
 * @fileOverview Generates personalized travel plans based on user preferences.
 *
 * - generateTravelPlans - A function that generates personalized travel plans.
 * - GenerateTravelPlansInput - The input type for the generateTravelPlans function.
 * - GenerateTravelPlansOutput - The return type for the generateTravelPlans function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTravelPlansInputSchema = z.object({
  destination: z.string().describe('The destination for the travel plan.'),
  duration: z.number().describe('The duration of the trip in days.'),
  accommodation: z.string().describe('The preferred type of accommodation (e.g., hotel, hostel, Airbnb).'),
  transport: z.string().describe('The preferred mode of transportation (e.g., car, public transport, walking).'),
  interests: z.array(z.string()).describe('A list of interests for the travel plan (e.g., museums, hiking, food).'),
  attractionType: z.string().describe('The type of attractions to suggest (e.g., unique local spots, typical touristic locations).'),
});
export type GenerateTravelPlansInput = z.infer<typeof GenerateTravelPlansInputSchema>;

const TravelPlanSchema = z.object({
  planName: z.string().describe('Name of the travel plan'),
  pointsOfInterest: z.array(z.string()).describe('A list of points of interest for the travel plan.'),
});

const GenerateTravelPlansOutputSchema = z.object({
  travelPlans: z.array(TravelPlanSchema).describe('A list of generated travel plans.'),
});
export type GenerateTravelPlansOutput = z.infer<typeof GenerateTravelPlansOutputSchema>;

export async function generateTravelPlans(input: GenerateTravelPlansInput): Promise<GenerateTravelPlansOutput> {
  return generateTravelPlansFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTravelPlansPrompt',
  input: {schema: GenerateTravelPlansInputSchema},
  output: {schema: GenerateTravelPlansOutputSchema},
  prompt: `You are a travel planning expert. Generate three alternative travel plans based on the following user preferences:

Destination: {{{destination}}}
Duration: {{{duration}}} days
Accommodation: {{{accommodation}}}
Transportation: {{{transport}}}
Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Attraction Type: {{{attractionType}}}

Each travel plan should include a list of points of interest and be tailored to the user's preferences.

Return the travel plans in the requested JSON format.
`,
});

const generateTravelPlansFlow = ai.defineFlow(
  {
    name: 'generateTravelPlansFlow',
    inputSchema: GenerateTravelPlansInputSchema,
    outputSchema: GenerateTravelPlansOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
