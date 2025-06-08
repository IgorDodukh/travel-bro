
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
  name: z.string().describe('The specific, official name of the point of interest (e.g., "Eiffel Tower", "Louvre Museum"). Should be concise and precise.'),
  description: z.string().optional().describe('A brief description of the point of interest or activity (e.g., "Iconic landmark with panoramic city views.", "World-renowned art museum."). Keep it to one sentence if possible.'),
  latitude: z.number().describe('The HIGHLY ACCURATE geographic latitude of the point of interest. Example: 48.85837 for Eiffel Tower. Precision is absolutely critical for mapping.'),
  longitude: z.number().describe('The HIGHLY ACCURATE geographic longitude of the point of interest. Example: 2.294481 for Eiffel Tower. Precision is absolutely critical for mapping.'),
});

const TravelPlanSchema = z.object({
  planName: z.string().describe('Name of the travel plan (e.g., "Parisian Adventure", "Roman Holiday").'),
  pointsOfInterest: z.array(AiPointOfInterestSchema).describe('A list of individual points of interest for the entire trip. Each POI should be a distinct place or activity with a name, an optional short description, and its precise latitude and longitude coordinates.'),
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
  prompt: `You are an expert travel planning assistant. Generate three alternative travel plans based on the following user preferences:

Destination: {{{destination}}}
Duration: {{{duration}}} days
Accommodation: {{{accommodation}}}
Transportation: {{{transport}}}
Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Attraction Type: {{{attractionType}}}

For each travel plan, provide a 'planName'.
Also, for each travel plan, provide a list of 'pointsOfInterest'. Each item in this list MUST be an object with:
1.  'name': The specific, official name of the point of interest (e.g., "Eiffel Tower", "Louvre Museum"). Be precise.
2.  'description' (optional): A brief, one-sentence description (e.g., "Iconic landmark with panoramic city views.").
3.  'latitude': The HIGHLY ACCURATE geographic latitude as a number (e.g., 48.85837 for the Eiffel Tower).
4.  'longitude': The HIGHLY ACCURATE geographic longitude as a number (e.g., 2.294481 for the Eiffel Tower).

**IMPORTANT FOR COORDINATE ACCURACY:**
The correct functioning of the application's map view depends ENTIRELY on the precision of these latitude and longitude coordinates.
- Treat this step as if you are querying a precise geographical database or map service for each named location to get its coordinates.
- DO NOT approximate, invent, or guess coordinates. Provide only verifiable, real-world coordinates.
- If a POI is very obscure and you cannot confidently provide highly accurate coordinates, it is better to select a slightly different, more verifiable POI that fits the user's interests.
- Double-check the coordinates you provide. For example, the Eiffel Tower in Paris, France is at approximately latitude 48.85837 and longitude 2.294481.

These points of interest are for the entire trip and will be distributed across the travel days later.
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

