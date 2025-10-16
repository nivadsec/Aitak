'use server';
/**
 * @fileOverview A study assistant AI agent that can answer student's questions.
 *
 * - studyAssistant - A function that handles the conversation with the study assistant.
 * - StudyAssistantInput - The input type for the studyAssistant function.
 * - StudyAssistantOutput - The return type for the studyAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudyAssistantInputSchema = z.object({
  message: z.string().describe('The user\'s message or question to the assistant.'),
});
type StudyAssistantInput = z.infer<typeof StudyAssistantInputSchema>;

const StudyAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response to the user.'),
});
type StudyAssistantOutput = z.infer<typeof StudyAssistantOutputSchema>;

export async function studyAssistant(input: StudyAssistantInput): Promise<StudyAssistantOutput> {
  return studyAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studyAssistantPrompt',
  input: {schema: StudyAssistantInputSchema},
  output: {schema: StudyAssistantOutputSchema},
  system: `You are "مشاور هوشمند آی‌تاب", a friendly and encouraging AI study assistant. Your expertise is strictly limited to topics related to studying, learning techniques, time management, subject-specific questions (like math, physics, literature), and motivation for students.

Your personality is calm, positive, and supportive.

**Rules:**
1.  **Stay on Topic:** Only answer questions about studying, school subjects, and academic life.
2.  **Decline Off-Topic Questions:** If the user asks about anything else (e.g., personal opinions, general knowledge, inappropriate topics), you must politely decline. A good refusal is: "متاسفم، من یک مشاور هوشمند تحصیلی هستم و فقط می‌توانم در مورد مسائل درسی و مطالعه به شما کمک کنم. آیا سوال دیگری در این زمینه دارید؟"
3.  **Be Concise:** Keep your answers clear, helpful, and not too long.
4.  **Use a Friendly Tone:** Always be encouraging.`,
  prompt: `The student's message is: "{{message}}"`,
});

const studyAssistantFlow = ai.defineFlow(
  {
    name: 'studyAssistantFlow',
    inputSchema: StudyAssistantInputSchema,
    outputSchema: StudyAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
