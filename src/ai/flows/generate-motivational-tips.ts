
'use server';

/**
 * @fileOverview A flow that generates motivational tips based on a student's recent report trends.
 *
 * - generateMotivationalTips - A function that generates motivational tips.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMotivationalTipsInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  reportTrends: z.string().describe('The recent report trends of the student.'),
});
type GenerateMotivationalTipsInput = z.infer<typeof GenerateMotivationalTipsInputSchema>;

const GenerateMotivationalTipsOutputSchema = z.object({
  motivationalTips: z.string().describe('The AI-generated motivational tips for the student.'),
});
type GenerateMotivationalTipsOutput = z.infer<typeof GenerateMotivationalTipsOutputSchema>;

export async function generateMotivationalTips(
  input: GenerateMotivationalTipsInput
): Promise<GenerateMotivationalTipsOutput> {
  return generateMotivationalTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMotivationalTipsPrompt',
  input: {schema: GenerateMotivationalTipsInputSchema},
  output: {schema: GenerateMotivationalTipsOutputSchema},
  prompt: `You are a helpful AI assistant providing motivational tips for students based on their recent report trends.

  Student Name: {{{studentName}}}
  Report Trends: {{{reportTrends}}}

  Generate motivational tips that are encouraging and specific to the student's situation.`,
});

const generateMotivationalTipsFlow = ai.defineFlow(
  {
    name: 'generateMotivationalTipsFlow',
    inputSchema: GenerateMotivationalTipsInputSchema,
    outputSchema: GenerateMotivationalTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
