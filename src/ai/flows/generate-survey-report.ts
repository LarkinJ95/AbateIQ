
'use server';

/**
 * @fileOverview An AI agent for generating comprehensive survey reports.
 *
 * - generateSurveyReport - A function that handles the report generation.
 * - GenerateSurveyReportInput - The input type for the generateSurveyReport function.
 * - GenerateSurveyReportOutput - The return type for the generateSurveyReport function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Survey, AsbestosSample, HomogeneousArea, FunctionalArea, PaintSample } from '@/lib/types';

// We can't pass complex objects with methods, so we define serializable types.
const SerializableFASchema = z.object({
  id: z.string(),
  faId: z.string(),
  faUse: z.string(),
});

const SerializableHASchema = z.object({
  id: z.string(),
  haId: z.string(),
  description: z.string(),
  functionalAreaIds: z.array(z.string()).optional().nullable(),
});

const SerializableAsbestosSampleSchema = z.object({
    id: z.string(),
    sampleNumber: z.string(),
    location: z.string(),
    material: z.string(),
    asbestosType: z.enum(['ND', 'Chrysotile', 'Amosite', 'Crocidolite', 'Trace']),
    asbestosPercentage: z.number().nullable(),
});

const SerializablePaintSampleSchema = z.object({
    id: z.string(),
    location: z.string(),
    paintColor: z.string(),
    analyte: z.enum(['Lead', 'Cadmium', '']),
    resultMgKg: z.number().nullable(),
});


const GenerateSurveyReportInputSchema = z.object({
  siteName: z.string(),
  address: z.string(),
  surveyDate: z.string(),
  inspector: z.string(),
  jobNumber: z.string().optional(),
  surveyType: z.array(z.string()),
  functionalAreas: z.array(SerializableFASchema),
  homogeneousAreas: z.array(SerializableHASchema),
  asbestosSamples: z.array(SerializableAsbestosSampleSchema),
  paintSamples: z.array(SerializablePaintSampleSchema),
});

export type GenerateSurveyReportInput = z.infer<typeof GenerateSurveyReportInputSchema>;

// Define a schema for the data being passed to the prompt itself, including stringified fields
const PromptInputSchema = GenerateSurveyReportInputSchema.extend({
  stringifiedFunctionalAreas: z.string(),
  stringifiedHomogeneousAreas: z.string(),
  stringifiedAsbestosSamples: z.string(),
  stringifiedPaintSamples: z.string(),
});


const GenerateSurveyReportOutputSchema = z.object({
  reportHtml: z.string().describe('The full survey report formatted as a single HTML string.'),
});

export type GenerateSurveyReportOutput = z.infer<typeof GenerateSurveyReportOutputSchema>;

export async function generateSurveyReport(input: GenerateSurveyReportInput): Promise<GenerateSurveyReportOutput> {
  return generateSurveyReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSurveyReportPrompt',
  input: { schema: PromptInputSchema }, // Use the extended schema
  output: { schema: GenerateSurveyReportOutputSchema },
  model: 'googleai/gemini-2.5-flash',
  prompt: `
    You are an expert environmental consultant specializing in generating regulatory-compliant survey reports for asbestos, lead, and other hazardous materials.
    Your task is to generate a complete, professional, and well-formatted HTML report based on the provided survey data.

    The report must be a single HTML string, including inline CSS for styling. Do not include any external stylesheets or scripts.
    The report should be structured logically with clear headings, tables, and summaries.

    **Report Sections:**
    1.  **Title Page:** Project Name, Address, Job Number, Survey Type(s), Survey Date, Inspector Name.
    2.  **Executive Summary:** A high-level overview of the findings. Mention if any hazardous materials were detected.
    3.  **Introduction & Scope:** Briefly describe the purpose of the survey.
    4.  **Functional Areas Summary:** A table listing all functional areas (FA ID, Use).
    5.  **Homogeneous Areas Summary:** A table listing all homogeneous areas (HA ID, Description, Linked FAs).
    6.  **Sampling Results:**
        *   Create a separate, clearly labeled table for each type of sample (e.g., "Asbestos Sample Results", "Lead Paint Sample Results").
        *   Asbestos Table Columns: Sample #, Location, Material, HA ID, Result (% and Type).
        *   Paint Table Columns: Sample #, Location, Color, Analyte, Result (mg/kg).
        *   Clearly indicate "ND" (Not Detected) or "Trace" where applicable.
    7.  **Conclusions & Recommendations:** Based on the results, provide clear conclusions and recommend next steps according to standard industry regulations (e.g., OSHA, EPA).

    **Formatting Requirements:**
    - Use clean, modern, and professional styling. Use a color palette of grays, blues, and whites.
    - Use tables (\`<table>\`, \`<th>\`, \`<tr>\`, \`<td>\`) for all data summaries. Tables should have borders and clear headers.
    - Use semantic HTML tags (\`<h1>\`, \`<h2>\`, \`<h3>\`, \`<p>\`, \`<ul>\`, \`<li>\`).
    - Ensure the final output is a single, complete HTML document string.

    **Input Data (parse these JSON strings):**
    - Site Name: {{{siteName}}}
    - Address: {{{address}}}
    - Survey Date: {{{surveyDate}}}
    - Inspector: {{{inspector}}}
    - Job Number: {{{jobNumber}}}
    - Survey Type: {{#each surveyType}}{{{this}}}{{/each}}
    - Functional Areas: {{{stringifiedFunctionalAreas}}}
    - Homogeneous Areas: {{{stringifiedHomogeneousAreas}}}
    - Asbestos Samples: {{{stringifiedAsbestosSamples}}}
    - Paint Samples: {{{stringifiedPaintSamples}}}

    Now, generate the complete HTML report.
  `,
});


const generateSurveyReportFlow = ai.defineFlow(
  {
    name: 'generateSurveyReportFlow',
    inputSchema: GenerateSurveyReportInputSchema,
    outputSchema: GenerateSurveyReportOutputSchema,
  },
  async (input) => {
     // Manually stringify the complex data before passing it to the prompt
    const promptInput = {
      ...input,
      stringifiedFunctionalAreas: JSON.stringify(input.functionalAreas),
      stringifiedHomogeneousAreas: JSON.stringify(input.homogeneousAreas),
      stringifiedAsbestosSamples: JSON.stringify(input.asbestosSamples),
      stringifiedPaintSamples: JSON.stringify(input.paintSamples),
    };

    const { output } = await prompt(promptInput);
    return output!;
  }
);
