'use server';
/**
 * @fileOverview An AI agent for analyzing a student's focus intervals.
 *
 * - analyzeFocusIntervals - A function that handles the focus analysis process.
 */

import {ai} from './genkit-analyze-focus';
import {z} from 'genkit';

const FocusIntervalInputSchema = z.object({
  intervalName: z.string().describe("The name of the study interval (e.g., 'Physics - Part 1')."),
  score: z.number().describe('The focus score from 0 to 10.'),
  timestamp: z.string().describe('The time the interval was recorded.'),
});

const AnalyzeFocusIntervalsInputSchema = z.object({
  studentId: z.string().describe('The ID of the student being analyzed.'),
  intervals: z.array(FocusIntervalInputSchema).describe('An array of focus intervals recorded by the student, sorted chronologically.'),
});
type AnalyzeFocusIntervalsInput = z.infer<typeof AnalyzeFocusIntervalsInputSchema>;


const AnalyzeFocusIntervalsOutputSchema = z.object({
  focusSummary: z.string().describe("A concise summary of the student's overall focus trend (e.g., stable, declining, improving) and average score."),
  positivePatterns: z.array(z.string()).describe("A list of identified positive patterns. Example: 'Focus is highest in the morning sessions.'"),
  negativePatterns: z.array(z.string()).describe("A list of identified negative patterns. Example: 'Focus consistently drops after 60 minutes of study.'"),
  recommendations: z.array(z.string()).describe('A list of calm, actionable recommendations for the student or teacher to improve focus.'),
});
type AnalyzeFocusIntervalsOutput = z.infer<typeof AnalyzeFocusIntervalsOutputSchema>;


export async function analyzeFocusIntervals(input: AnalyzeFocusIntervalsInput): Promise<AnalyzeFocusIntervalsOutput> {
  return analyzeFocusIntervalsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFocusIntervalsPrompt',
  input: {schema: AnalyzeFocusIntervalsInputSchema},
  output: {schema: AnalyzeFocusIntervalsOutputSchema},
  system: `You are an expert educational analyst AI for "آی‌تاب". Your philosophy is "Epic Calm Intelligence". Your analysis must be data-driven, calm, and insightful.

Your goal is to analyze a student's focus scores over a series of study intervals.

1.  **Calculate Overall Trend:** Determine if the student's focus is generally improving, declining, or remaining stable across the provided intervals. Calculate the average focus score.
2.  **Identify Patterns:** Look for correlations between time of day (from timestamps) and focus scores. Identify if focus wanes after a certain number of intervals or duration. Check if certain subjects (from interval names) have higher or lower focus scores.
3.  **Generate Summary:** Write a neutral, objective summary of your findings in 'focusSummary'.
4.  **Extract Positive & Negative Patterns:** List specific, data-backed positive and negative patterns you observed in the respective arrays. Be concrete (e.g., "Focus scores for 'Math' are 2 points higher on average than 'History'").
5.  **Provide Recommendations:** Based on your analysis, provide calm, constructive recommendations in the 'recommendations' array to help the student improve focus (e.g., "Suggest taking a short break after every two study intervals.").`,
  prompt: `Analyze the following student focus interval data. The data is ordered chronologically.

Student ID: {{{studentId}}}

Focus Intervals:
{{#each intervals}}
  - Time: {{timestamp}}, Interval: "{{intervalName}}", Score: {{score}}/10
{{/each}}
`,
});

const analyzeFocusIntervalsFlow = ai.defineFlow(
  {
    name: 'analyzeFocusIntervalsFlow',
    inputSchema: AnalyzeFocusIntervalsInputSchema,
    outputSchema: AnalyzeFocusIntervalsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
