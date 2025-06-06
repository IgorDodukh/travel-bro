
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

const AiPointOfInterestSchema = z.object({
  name: z.string().describe('The name of the point of interest (e.g., "Eiffel Tower", "Louvre Museum"). Should be concise.'),
  description: z.string().optional().describe('A brief description of the point of interest or activity (e.g., "Iconic landmark with panoramic city views.", "World-renowned art museum."). Keep it to one sentence if possible.'),
  latitude: z.number().describe('The geographic latitude of the point of interest. Example: 48.8584 for Eiffel Tower.'),
  longitude: z.number().describe('The geographic longitude of the point of interest. Example: 2.2945 for Eiffel Tower.'),
});

const TravelPlanSchema = z.object({
  planName: z.string().describe('Name of the travel plan (e.g., "Parisian Adventure", "Roman Holiday").'),
  pointsOfInterest: z.array(AiPointOfInterestSchema).describe('A list of individual points of interest for the entire trip. Each POI should be a distinct place or activity with a name, an optional short description, and its latitude and longitude coordinates.'),
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

For each travel plan, provide a 'planName'.
Also, for each travel plan, provide a list of 'pointsOfInterest'. Each item in this list should be an object with a 'name' (e.g., "Eiffel Tower"), an optional brief 'description' (e.g., "Iconic landmark with panoramic views"), and its 'latitude' and 'longitude' as numerical geographic coordinates. Ensure these coordinates are accurate for mapping purposes. These points of interest will be for the entire trip and will be distributed across the travel days later.
Ensure each point of interest is a distinct, actionable item.

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
