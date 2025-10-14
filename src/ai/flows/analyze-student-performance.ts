'use server';

/**
 * @fileOverview A student performance analysis AI agent.
 *
 * - analyzeStudentPerformance - A function that handles the student performance analysis process.
 * - AnalyzeStudentPerformanceInput - The input type for the analyzeStudentPerformance function.
 * - AnalyzeStudentPerformanceOutput - The return type for the analyzeStudentPerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeStudentPerformanceInputSchema = z.object({
  studentId: z.string().describe('The ID of the student to analyze.'),
  dailyReports: z.array(
    z.object({
      date: z.string().describe('The date of the report (YYYY-MM-DD).'),
      studyHours: z.number().describe('The number of hours studied.'),
      testCorrectPercentage: z
        .number()
        .describe('The percentage of test questions answered correctly.'),
      moodRating: z.number().describe('A rating of the student\'s mood (1-10).'),
      mobileUsageHours: z.number().describe('The number of hours of mobile usage.'),
    })
  ).describe('An array of the student\'s daily reports.'),
});
export type AnalyzeStudentPerformanceInput = z.infer<
  typeof AnalyzeStudentPerformanceInputSchema
>;

const AnalyzeStudentPerformanceOutputSchema = z.object({
  performanceSummary: z.string().describe('A summary of the student\'s performance.'),
  alerts: z.array(
    z.string().describe('Any alerts regarding the student\'s performance.')
  ).optional(),
  recommendations: z
    .array(z.string().describe('Recommendations for the student.'))
    .optional(),
  incentiveRecommendation: z
    .string()
    .describe('A recommendation for an incentive to motivate the student')
    .optional(),
});
export type AnalyzeStudentPerformanceOutput = z.infer<
  typeof AnalyzeStudentPerformanceOutputSchema
>;

const recommendIncentive = ai.defineTool({
  name: 'recommendIncentive',
  description: 'Recommends an incentive to motivate a student based on their performance and mood.',
  inputSchema: z.object({
    performanceSummary: z.string().describe('A summary of the student\'s performance.'),
    moodRating: z.number().describe('A rating of the student\'s mood (1-10).'),
  }),
  outputSchema: z.string().describe('A recommendation for an incentive.'),
},
async (input) => {
  // Placeholder implementation for incentive recommendation.
  // In a real application, this could involve querying a database
  // of incentives or using a separate AI model to generate recommendations.
  if (input.moodRating <= 3) {
    return 'Consider offering the student extra credit or a small reward for improved mood and effort.';
  } else if (input.performanceSummary.includes('declining performance')) {
    return 'Suggest a study group or tutoring session to help the student improve their grades.';
  } else {
    return 'Praise the student for their hard work and dedication.';
  }
});

export async function analyzeStudentPerformance(
  input: AnalyzeStudentPerformanceInput
): Promise<AnalyzeStudentPerformanceOutput> {
  return analyzeStudentPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeStudentPerformancePrompt',
  input: {schema: AnalyzeStudentPerformanceInputSchema},
  output: {schema: AnalyzeStudentPerformanceOutputSchema},
  tools: [recommendIncentive],
  system: `You are an AI assistant that analyzes student performance data and provides alerts for decreasing motivation or declining performance.  If the student performance declines, call the recommendIncentive tool to recommend an incentive.`,
  prompt: `Analyze the following student performance data and provide a summary, alerts, and recommendations.

Student ID: {{{studentId}}}
Daily Reports:
{{#each dailyReports}}
  - Date: {{date}}, Study Hours: {{studyHours}}, Test Correct Percentage: {{testCorrectPercentage}}, Mood Rating: {{moodRating}}, Mobile Usage Hours: {{mobileUsageHours}}
{{/each}}

Consider these factors when providing alerts and recommendations:
- Decreasing study hours
- Declining test scores
- Low mood ratings
- Excessive mobile usage

Output format:
Performance Summary: [A brief summary of the student's overall performance.]
Alerts: [A list of alerts regarding the student's performance.]
Recommendations: [A list of recommendations for the student.]`,
});

const analyzeStudentPerformanceFlow = ai.defineFlow(
  {
    name: 'analyzeStudentPerformanceFlow',
    inputSchema: AnalyzeStudentPerformanceInputSchema,
    outputSchema: AnalyzeStudentPerformanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
