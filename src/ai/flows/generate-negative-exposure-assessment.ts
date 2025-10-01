'use server';

/**
 * @fileOverview A negative exposure assessment (NEA) generation AI agent.
 *
 * - generateNegativeExposureAssessment - A function that handles the NEA generation process.
 * - GenerateNegativeExposureAssessmentInput - The input type for the generateNegativeExposureAssessment function.
 * - GenerateNegativeExposureAssessmentOutput - The return type for the generateNegativeExposureAssessment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNegativeExposureAssessmentInputSchema = z.object({
  projectDescription: z.string().describe('The description of the project.'),
  taskDescription: z.string().describe('The description of the task.'),
  analyte: z.string().describe('The analyte for the assessment.'),
});
export type GenerateNegativeExposureAssessmentInput = z.infer<
  typeof GenerateNegativeExposureAssessmentInputSchema
>;

const GenerateNegativeExposureAssessmentOutputSchema = z.object({
  draftAssessment: z
    .string()
    .describe('A draft of the negative exposure assessment.'),
});
export type GenerateNegativeExposureAssessmentOutput = z.infer<
  typeof GenerateNegativeExposureAssessmentOutputSchema
>;

export async function generateNegativeExposureAssessment(
  input: GenerateNegativeExposureAssessmentInput
): Promise<GenerateNegativeExposureAssessmentOutput> {
  return generateNegativeExposureAssessmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNegativeExposureAssessmentPrompt',
  input: {schema: GenerateNegativeExposureAssessmentInputSchema},
  output: {schema: GenerateNegativeExposureAssessmentOutputSchema},
  prompt: `You are an expert industrial hygienist specializing in creating Negative Exposure Assessments (NEAs).

You will use the project description, task description, and analyte to generate a draft NEA.

Project Description: {{{projectDescription}}}
Task Description: {{{taskDescription}}}
Analyte: {{{analyte}}}

Draft NEA:`,
});

const generateNegativeExposureAssessmentFlow = ai.defineFlow(
  {
    name: 'generateNegativeExposureAssessmentFlow',
    inputSchema: GenerateNegativeExposureAssessmentInputSchema,
    outputSchema: GenerateNegativeExposureAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
