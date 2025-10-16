'use server';

/**
 * @fileOverview A student performance analysis AI agent.
 *
 * - analyzeStudentPerformance - A function that handles the student performance analysis process.
 */

import {ai} from './genkit-analyze-student';
import {z} from 'genkit';

const DailyReportInputSchema = z.object({
  date: z.string().describe('The date of the report (YYYY-MM-DD).'),
  studyHours: z.number().describe('The total number of hours studied on this day.'),
  testCorrectPercentage: z
    .number()
    .describe('The average percentage of test questions answered correctly on this day. Can be 0 if no tests were taken.'),
  moodRating: z.number().describe('A rating of the student\'s mood from 1 (worst) to 10 (best).'),
  mobileUsageHours: z.number().describe('The number of hours of mobile phone usage on this day.'),
});

const AnalyzeStudentPerformanceInputSchema = z.object({
  studentId: z.string().describe('The ID of the student to analyze.'),
  dailyReports: z.array(DailyReportInputSchema).describe('An array of the student\'s daily reports from the last 1-2 weeks.'),
});
type AnalyzeStudentPerformanceInput = z.infer<
  typeof AnalyzeStudentPerformanceInputSchema
>;

const AnalyzeStudentPerformanceOutputSchema = z.object({
  performanceSummary: z.string().describe('A concise, analytical summary of the student\'s performance, trends, and potential correlations (e.g., sleep vs. scores). This should be a neutral, data-driven overview.'),
  alerts: z.array(
    z.string().describe('A specific, actionable alert if a negative trend is detected (e.g., "Study hours have dropped by 30% over the last 3 days while mobile usage increased."). Generate alerts only for significant negative changes.')
  ),
  recommendations: z
    .array(z.string().describe('A calm, encouraging, and actionable recommendation for the student or teacher based on the analysis (eg., "Suggest breaking study sessions into smaller chunks to maintain focus.").'))
    ,
  incentiveRecommendation: z
    .string()
    .describe('A recommendation for an incentive to motivate the student, based on their performance and mood.')
    .optional(),
});
type AnalyzeStudentPerformanceOutput = z.infer<
  typeof AnalyzeStudentPerformanceOutputSchema
>;

const recommendIncentive = ai.defineTool({
  name: 'recommendIncentive',
  description: 'Recommends an incentive to motivate a student based on their performance and mood.',
  inputSchema: z.object({
    performanceSummary: z.string().describe('A summary of the student\'s performance.'),
    moodRating: z.number().describe('The latest mood rating of the student (1-10).'),
  }),
  outputSchema: z.string().describe('A recommendation for an incentive.'),
},
async (input) => {
  if (input.moodRating <= 4) {
    return 'Consider a non-academic reward to boost morale, like a short break or a favorite activity, after completing a study goal.';
  } else if (input.performanceSummary.includes('declining') || input.performanceSummary.includes('decreasing')) {
    return 'Suggest a "comeback" challenge with a small reward, like earning extra points for consistent effort over the next few days.';
  } else if (input.performanceSummary.includes('improving') || input.performanceSummary.includes('increasing')) {
    return 'Acknowledge the positive trend with verbal praise and highlight how their effort is paying off.';
  }
  return 'Reinforce positive habits with consistent encouragement.';
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
  system: `You are an expert educational analyst AI for "آی‌تاب". Your philosophy is "Epic Calm Intelligence". Your analysis must be data-driven, calm, and insightful. Identify correlations between study habits, sleep, mobile usage, and performance.

Your primary goal is to provide a clear, cause-and-effect analysis of a student's behavior and performance based on their recent daily reports.

1.  **Analyze Trends:** Look at the data chronologically. Identify trends in study hours, test scores, mood, and mobile usage. Is performance improving, declining, or stable?
2.  **Find Correlations:** Is there a connection between lower mood ratings and lower test scores? Does increased mobile usage correlate with decreased study time? Explicitly mention these correlations in your summary.
3.  **Generate Summary:** Write a neutral, objective summary of your findings in the 'performanceSummary' field.
4.  **Create Alerts:** If you detect a significant negative trend (e.g., a sharp drop in scores, a consistent increase in mobile usage while studying decreases), create a specific, data-backed alert in the 'alerts' array. Be precise (e.g., "Mood has dropped from 8 to 5 in three days.").
5.  **Provide Recommendations:** Based on your analysis, provide calm, constructive, and actionable recommendations in the 'recommendations' array. These should help the teacher or student address the identified issues.
6.  **Use Incentive Tool:** If the analysis indicates declining motivation or a significant struggle, use the 'recommendIncentive' tool to suggest a suitable motivational incentive.`,
  prompt: `Analyze the following student performance data. The data is ordered from most recent to oldest.

Student ID: {{{studentId}}}
Recent Daily Reports:
{{#each dailyReports}}
  - Date: {{date}}, Study Hours: {{studyHours}}, Test Correct %: {{testCorrectPercentage}}, Mood: {{moodRating}}/10, Mobile: {{mobileUsageHours}}h
{{/each}}
`,
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
