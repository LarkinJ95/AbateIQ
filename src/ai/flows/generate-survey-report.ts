
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
  length: z.number().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
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
    homogeneousAreaId: z.string(),
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

// =================================================================================
// CUSTOMIZATION AREA 1: INPUT SCHEMA
// This schema defines all the data you can pass to the report generator.
// To add new customizable data to your report (e.g., a new field, a footer note),
// add it to this Zod schema first. Then, you can reference it in the prompt below.
// =================================================================================
const GenerateSurveyReportInputSchema = z.object({
  // Basic Info
  siteName: z.string(),
  address: z.string(),
  surveyDate: z.string(),
  inspector: z.string(),
  jobNumber: z.string().optional(),
  surveyType: z.array(z.string()),

  // Data Arrays
  functionalAreas: z.array(SerializableFASchema),
  homogeneousAreas: z.array(SerializableHASchema),
  asbestosSamples: z.array(SerializableAsbestosSampleSchema),
  paintSamples: z.array(SerializablePaintSampleSchema),
  
  // Branding & Customization
  companyName: z.string(),
  logoDataUri: z.string().optional(),
  primaryColor: z.string().optional().default('#00BFFF'), // Deep Sky Blue
  accentColor: z.string().optional().default('#708090'), // Slate Blue
  
  // Photos
  mainPhotoDataUri: z.string().optional(),
  floorPlanDataUri: z.string().optional(),
  positiveMaterialPhotoDataUris: z-array(z.string()).optional(),

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


// =================================================================================
// CUSTOMIZATION AREA 2: THE AI PROMPT
// This is the main template for the AI-generated HTML report.
// You can modify the HTML structure, inline CSS, and content sections here.
// Use Handlebars syntax `{{{fieldName}}}` to insert data from the Input Schema above.
// For example, to use the company name, you would use `{{{companyName}}}`.
// =================================================================================
const prompt = ai.definePrompt({
  name: 'generateSurveyReportPrompt',
  input: { schema: PromptInputSchema }, // Use the extended schema
  output: { schema: GenerateSurveyReportOutputSchema },
  model: 'googleai/gemini-2.5-flash',
  prompt: `
    You are an expert environmental consultant specializing in generating regulatory-compliant survey reports for asbestos, lead, and other hazardous materials.
    Your task is to generate a complete, professional, and well-formatted HTML report based on the provided survey data.

    **Report Structure & Content:**
    1.  **Cover Page:**
        -   Display the main site photo prominently if provided ({{{mainPhotoDataUri}}}).
        -   Include: Report Title (e.g., "Hazardous Material Survey Report"), Site Name, Address, Job Number, Survey Date, and Company Name.
        -   Optionally include the company logo ({{{logoDataUri}}}).

    2.  **Executive Summary:** A high-level overview of the findings. Mention if any hazardous materials were detected.

    3.  **Introduction & Scope:** Briefly describe the purpose of the survey.

    4.  **Inspection Methods:** Include the following text block verbatim:
        "To identify materials suspected to contain asbestos at the residence a systematic inspection procedure was followed including selective demolition in areas where it was believed there may be hidden materials. Visual examination, material age, and professional experience were relied upon to determine suspect materials. Suspect materials that were similar in color and texture were classified into homogenous areas (e.g., drywall, ceiling tiles, mastic).
        Suspect materials were grouped into three main categories as follows:
        - Surfacing Materials (SM) – defined as material that is sprayed on, troweled on, or otherwise applied to surfaces such as acoustical plaster on ceilings, fireproofing materials on structural members, or other materials on surfaces for acoustical, fireproofing, or other purposes.
        - Thermal System Insulation (TSI) – defined as materials applied to pipes, boilers, tanks, ducts, etc. to prevent heat loss, heat gain, or water condensation.
        - Miscellaneous Materials (MM) – defined as any application that does not fall into the SM or TSI categories such as floor tile, roofing, drywall, etc."

    5.  **Functional Areas (FA) Summary:**
        -   A table listing all functional areas.
        -   Columns: FA ID, Use, Length (ft), Width (ft), Height (ft), Floor Area (sqft).

    6.  **Homogeneous Areas (HA) Summary:**
        -   A table listing all homogeneous areas.
        -   Columns: HA ID, Description, Linked FAs.

    7.  **Sampling Results:**
        -   **Asbestos Table:**
            -   Columns must be in this exact order: Sample #, HA ID, Location, Material, Result (% and Type).
            -   Clearly indicate "ND" (Not Detected) or "Trace" where applicable.
        -   **Paint Results Tables:**
            -   Create a separate table for EACH analyte (e.g., "Lead Paint Sample Results", "Cadmium Paint Sample Results").
            -   Columns: Sample Location, Paint Color, Result (mg/kg), Result (% by weight).
            -   Calculate '% by weight' as (mg/kg) / 10000. Format it to four decimal places.

    8.  **Floor Plan / Sketch:**
        -   If a floor plan is provided ({{{floorPlanDataUri}}}), display it here under a clear heading.

    9.  **Positive Material Photos:**
        -   If photos are provided ({{{positiveMaterialPhotoDataUris}}}), display them in a gallery under a clear heading.

    10. **Conclusions & Recommendations:** Based on the results, provide clear conclusions and recommend next steps according to standard industry regulations (e.g., OSHA, EPA).

    11. **Disclaimer:** Include this exact text at the very end: "Should suspect materials be encountered during renovation or demolition activities for which no analytical data exists, {{{companyName}}} recommends the materials remain undisturbed until the asbestos content of the materials is determined in accordance with OSHA and EPA regulations."

    **Formatting & Styling Requirements:**
    - The entire output MUST be a single, complete HTML document string.
    - Use inline CSS within a \`<style>\` tag in the \`<head>\`.
    - Use Google's 'Inter' font for the body.
    - Use the provided branding:
        - Primary Color (for headers, table borders): {{{primaryColor}}}
        - Accent Color (for sub-headers): {{{accentColor}}}
    - Use semantic HTML tags (\`<h1>\`, \`<h2>\`, \`<p>\`, etc.) and well-structured tables (\`<table>\`).
    - The cover page should be visually distinct. Photos should be well-integrated and sized appropriately.

    **Input Data (parse these JSON strings):**
    - Site & Survey Info: {{{siteName}}}, {{{address}}}, {{{surveyDate}}}, {{{inspector}}}, {{{jobNumber}}}, Survey Types: {{#each surveyType}}{{{this}}}{{/each}}
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
