
'use server';

import { generateNegativeExposureAssessment, GenerateNegativeExposureAssessmentInput } from '@/ai/flows/generate-negative-exposure-assessment';
import { z } from 'zod';

const NeaSchema = z.object({
  projectDescription: z.string().min(10, 'Please provide a more detailed project description.'),
  taskDescription: z.string().min(10, 'Please provide a more detailed task description.'),
  analyte: z.string().min(2, 'Analyte is required.'),
});

export type NeaFormState = {
  message: string;
  assessment: string;
  isError: boolean;
  inputs: GenerateNegativeExposureAssessmentInput | null;
};

export async function generateNeaAction(
  prevState: NeaFormState,
  formData: FormData
): Promise<NeaFormState> {
  const validatedFields = NeaSchema.safeParse({
    projectDescription: formData.get('projectDescription'),
    taskDescription: formData.get('taskDescription'),
    analyte: formData.get('analyte'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your inputs.',
      assessment: '',
      isError: true,
      inputs: null,
    };
  }

  try {
    const result = await generateNegativeExposureAssessment(validatedFields.data);
    return {
      message: 'Assessment generated successfully.',
      assessment: result.draftAssessment,
      isError: false,
      inputs: validatedFields.data,
    };
  } catch (error) {
    console.error(error);
    return {
      message: 'An error occurred while generating the assessment.',
      assessment: '',
      isError: true,
      inputs: null,
    };
  }
}
