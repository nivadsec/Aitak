'use server';
/**
 * @fileOverview An AI agent for analyzing a student's weekly progress report.
 *
 * - analyzeWeeklyProgress - A function that handles the weekly progress analysis.
 * - AnalyzeWeeklyProgressInput - The input type for the analyzeWeeklyProgress function.
 * - AnalyzeWeeklyProgressOutput - The return type for the analyzeWeeklyProgress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeWeeklyProgressInputSchema = z.object({
  studentId: z.string().describe('The ID of the student being analyzed.'),
  weekNumber: z.number().describe('The week number of the report.'),
  thisWeekTotalStudy: z.number().describe('Total minutes studied this week.'),
  lastWeekTotalStudy: z.number().describe('Total minutes studied last week.'),
  thisWeekTotalTests: z.number().describe('Total tests taken this week.'),
  lastWeekTotalTests: z.number().describe('Total tests taken last week.'),
  keyAchievements: z.string().optional().describe("The student's self-reported key achievements for the week."),
  whatWentWell: z.string().describe("The student's reflection on what went well."),
  whatCouldBeBetter: z.string().describe("The student's reflection on what could have been better."),
  nextWeekGoals: z.string().describe("The student's self-defined goals for the next week."),
});
export type AnalyzeWeeklyProgressInput = z.infer<typeof AnalyzeWeeklyProgressInputSchema>;

const AnalyzeWeeklyProgressOutputSchema = z.object({
  progressSummary: z.string().describe("A summary comparing this week's quantitative data (study time, test count) to last week's."),
  reflectionAnalysis: z.string().describe("An analysis of the student's self-reflection, connecting 'what went well' and 'what could be better' to the quantitative data."),
  goalSuggestions: z.array(z.string()).describe("A list of 2-3 specific, measurable, and encouraging suggestions to refine or add to the student's goals for the next week, based on the analysis."),
});
export type AnalyzeWeeklyProgressOutput = z.infer<typeof AnalyzeWeeklyProgressOutputSchema>;


export async function analyzeWeeklyProgress(input: AnalyzeWeeklyProgressInput): Promise<AnalyzeWeeklyProgressOutput> {
  return analyzeWeeklyProgressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWeeklyProgressPrompt',
  input: {schema: AnalyzeWeeklyProgressInputSchema},
  output: {schema: AnalyzeWeeklyProgressOutputSchema},
  system: `You are an expert educational analyst AI for "آی‌تاب" with a philosophy of "Epic Calm Intelligence".

Your goal is to analyze a student's weekly self-reflection report. Be data-driven, encouraging, and forward-looking.

1.  **Quantitative Summary:** Compare 'thisWeekTotalStudy' and 'thisWeekTotalTests' with the previous week. State the change clearly (e.g., "Study time increased by 20%..."). Put this in 'progressSummary'.
2.  **Analyze Reflection:** Read the student's reflections ('whatWentWell', 'whatCouldBeBetter', 'keyAchievements'). Connect them to the data. For example, if they said "I was more focused" and study time increased, acknowledge that connection. Put this analysis in 'reflectionAnalysis'.
3.  **Evaluate Goals:** Look at 'nextWeekGoals'. Are they specific and measurable?
4.  **Suggest Goal Refinements:** In the 'goalSuggestions' array, provide 2-3 actionable suggestions. If their goals are vague (e.g., "study more"), suggest a specific target (e.g., "Try to increase study time for Math by 30 minutes each day"). If they identified a weakness, suggest a goal to address it.`,
  prompt: `Analyze the following weekly progress report for Student ID {{{studentId}}}.

**Week {{weekNumber}} Data:**
- This Week's Study Time: {{thisWeekTotalStudy}} minutes
- Last Week's Study Time: {{lastWeekTotalStudy}} minutes
- This Week's Test Count: {{thisWeekTotalTests}} tests
- Last Week's Test Count: {{lastWeekTotalTests}} tests

**Student's Reflection:**
- Key Achievements: "{{keyAchievements}}"
- What Went Well: "{{whatWentWell}}"
- What Could Be Better: "{{whatCouldBeBetter}}"
- Goals for Next Week: "{{nextWeekGoals}}"
`,
});

const analyzeWeeklyProgressFlow = ai.defineFlow(
  {
    name: 'analyzeWeeklyProgressFlow',
    inputSchema: AnalyzeWeeklyProgressInputSchema,
    outputSchema: AnalyzeWeeklyProgressOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
