
'use server';

/**
 * @fileOverview Generates a personal stats dashboard for students with study habits, progress charts, and motivation tips.
 *
 * - generatePersonalStatsDashboard - A function that generates a personal stats dashboard.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalStatsDashboardInputSchema = z.object({
  studyHours: z
    .number()
    .describe('The number of hours the student has studied.'),
  testScores: z
    .number()
    .describe('The student test scores on a scale of 0 to 100.'),
  sleepHours: z
    .number()
    .describe('The number of hours the student slept.'),
  moodScore: z
    .number()
    .describe('The student current mood score on a scale of 1 to 10.'),
});
type PersonalStatsDashboardInput = z.infer<typeof PersonalStatsDashboardInputSchema>;

const PersonalStatsDashboardOutputSchema = z.object({
  studyHabitsChart: z.string().describe('A chart displaying the student study habits.'),
  progressChart: z.string().describe('A chart displaying the student progress.'),
  motivationTip: z.string().describe('An automatically generated motivation tip.'),
});
type PersonalStatsDashboardOutput = z.infer<typeof PersonalStatsDashboardOutputSchema>;

export async function generatePersonalStatsDashboard(
  input: PersonalStatsDashboardInput
): Promise<PersonalStatsDashboardOutput> {
  return generatePersonalStatsDashboardFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalStatsDashboardPrompt',
  input: {schema: PersonalStatsDashboardInputSchema},
  output: {schema: PersonalStatsDashboardOutputSchema},
  prompt: `You are an AI assistant designed to generate a personal stats dashboard for students.

You will receive data about a student's study hours, test scores, sleep hours, and mood score.

Based on this data, you will generate two charts: one displaying the student's study habits and another displaying their progress.
You will also generate a motivation tip based on the student's trend analysis.

Data:
Study Hours: {{studyHours}}
Test Scores: {{testScores}}
Sleep Hours: {{sleepHours}}
Mood Score: {{moodScore}}

Output:
Study Habits Chart:
Progress Chart:
Motivation Tip:`, // TODO: Update prompt to handle chart generation
});

const generatePersonalStatsDashboardFlow = ai.defineFlow(
  {
    name: 'generatePersonalStatsDashboardFlow',
    inputSchema: PersonalStatsDashboardInputSchema,
    outputSchema: PersonalStatsDashboardOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
