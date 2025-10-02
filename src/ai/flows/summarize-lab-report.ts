
'use server';

/**
 * @fileOverview A lab report summarization AI agent.
 *
 * - summarizeLabReport - A function that handles the lab report summarization process.
 * - SummarizeLabReportInput - The input type for the summarizeLabReport function.
 * - SummarizeLabReportOutput - The return type for the summarizeLabReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SummarizeLabReportInputSchema = z.object({
  reportDataUri: z
    .string()
    .describe(
      "A lab report document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeLabReportInput = z.infer<typeof SummarizeLabReportInputSchema>;

const SummarizeLabReportOutputSchema = z.object({
  summary: z.string().describe('A summary of the key findings in the lab report.'),
  exceedances: z
    .string()
    .describe(
      'A description of any exceedances found in the lab report, including the analyte, concentration, limit, and compliance status.'
    ),
});
export type SummarizeLabReportOutput = z.infer<typeof SummarizeLabReportOutputSchema>;

export async function summarizeLabReport(input: SummarizeLabReportInput): Promise<SummarizeLabReportOutput> {
  return summarizeLabReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLabReportPrompt',
  input: {schema: SummarizeLabReportInputSchema},
  output: {schema: SummarizeLabReportOutputSchema},
  prompt: `You are an AI expert in occupational hygiene and air monitoring, specializing in reviewing lab reports.

You will review the provided lab report and provide a summary of the key findings and any potential exceedances of exposure limits.

Make sure to include any analytes that exceed exposure limits, their concentration, the corresponding exposure limit, and the compliance status.

Lab Report:
{{media url=reportDataUri}}`,
});

const summarizeLabReportFlow = ai.defineFlow(
  {
    name: 'summarizeLabReportFlow',
    inputSchema: SummarizeLabReportInputSchema,
    outputSchema: SummarizeLabReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
