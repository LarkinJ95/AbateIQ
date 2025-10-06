

'use server';

/**
 * @fileOverview An AI agent for generating comprehensive survey reports.
 *
 * CUSTOMIZATION AREA: This file is the central place to customize AI-generated reports.
 * 1. `GenerateSurveyReportInputSchema`: Defines all data available to the AI.
 *    To add new data to your report, add it here first.
 * 2. The `prompt` string: This is a large template that contains all the HTML and CSS
 *    for the report. To change styling (colors, fonts, layout) or the report's
 *    structure, you will modify this prompt directly.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// #################################################################################
// SCHEMAS (Input and Output definitions)
// #################################################################################

// We can't pass complex objects with methods, so we define serializable types for the AI.
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

/**
 * CUSTOMIZATION AREA 1: INPUT SCHEMA
 * This schema defines all the data you can pass to the report generator.
 * To add new customizable data (e.g., a new field, a footer note), add it here first.
 */
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
  logoUrl: z.string().optional().nullable(),
  primaryColor: z.string().optional().default('#00BFFF'), // Deep Sky Blue
  accentColor: z.string().optional().default('#708090'), // Slate Blue
  
  // Photos
  mainPhotoUrl: z.string().optional().nullable(),
  floorPlanUrl: z.string().optional().nullable(),
  positiveMaterialPhotoUrls: z.array(z.string()).optional(),
});
export type GenerateSurveyReportInput = z.infer<typeof GenerateSurveyReportInputSchema>;


// The final output schema expected from the main exported function.
const GenerateSurveyReportOutputSchema = z.object({
  reportHtml: z.string().describe('The full survey report formatted as a single HTML string.'),
});
export type GenerateSurveyReportOutput = z.infer<typeof GenerateSurveyReportOutputSchema>;


// #################################################################################
// AI PROMPT (The "brains" of the operation)
// #################################################################################


/**
 * CUSTOMIZATION AREA 2: Main Report Prompt
 * This prompt acts as the "director" for the report. It contains all the HTML and CSS.
 * To change styling (fonts, colors, table layouts) or the HTML structure of the report,
 * modify the `prompt` string here.
 */
const prompt = ai.definePrompt({
    name: 'generateSurveyReportPrompt',
    input: { schema: GenerateSurveyReportInputSchema },
    prompt: `
        You are an expert HTML and CSS developer creating a professional environmental survey report.
        Generate a single, complete HTML document based on the provided data.
        The final output must be ONLY the raw HTML, starting with <html> and ending with </html>.

        **Styling Rules:**
        - Font: Use Google's 'Inter' font.
        - Primary Color (for headers, table borders): {{{primaryColor}}}
        - Accent Color (for sub-headers): {{{accentColor}}}
        - Use semantic HTML tags and well-structured tables. Photos should be responsive.
        
        **Data for Report:**
        \`\`\`json
        {{{json this}}}
        \`\`\`

        **HTML Structure:**
        Create the full HTML document structure (\`<html><head>...<style>...</style></head><body>...</body></html>\`).
        
        Include all necessary CSS in the \`<style>\` tag.
        
        The body should contain the following sections in order:
        1.  **Cover Page**: A visually distinct cover page with the main photo, report title, site name, address, job number, date, and company name/logo.
        2.  **Executive Summary**: A high-level overview of findings. Mention if hazardous materials were found.
        3.  **Introduction**: A brief intro paragraph.
        4.  **Inspection Methods**: Include a standard text block about inspection methods.
        5.  **Functional Areas Summary**: A table for Functional Areas with columns: FA ID, Use, Length, Width, Height, Floor Area.
        6.  **Homogeneous Areas Summary**: A table for Homogeneous Areas with columns: HA ID, Description, Linked FAs.
        7.  **Asbestos Results**: A table for Asbestos Samples. Columns must be in this order: Sample #, HA ID, Location, Material, Result.
        8.  **Paint Results**: Create a separate table for EACH analyte (e.g., "Lead Paint Sample Results"). Columns: Sample Location, Paint Color, Result (mg/kg), Result (% by weight). Calculate '% by weight' as (mg/kg) / 10000.
        9.  **Floor Plan**: Display the floor plan image under a clear heading.
        10. **Positive Material Photos**: Display all provided photos in a gallery under a clear heading. If there are multiple photos in \`positiveMaterialPhotoUrls\`, create a grid or flexbox layout to show them all.
        11. **Conclusions**: Provide clear next steps based on the findings.
        12. **Disclaimer**: Include a standard disclaimer text, inserting the company name.

        Now, generate the complete HTML document.
      `,
  });


// #################################################################################
// EXPORTED FLOW (The main function called by the app)
// #################################################################################


const generateSurveyReportFlow = ai.defineFlow(
    {
      name: 'generateSurveyReportFlow',
      inputSchema: GenerateSurveyReportInputSchema,
      outputSchema: GenerateSurveyReportOutputSchema,
    },
    async (input) => {
      // The AI's task is simplified to only return the raw HTML string.
      const response = await prompt(input);
      const rawHtml = response.text;

      // We wrap the AI's output in the required JSON structure here, in reliable code.
      return {
        reportHtml: rawHtml,
      };
    }
);

/**
 * This is the main function that orchestrates the AI report generation.
 */
export async function generateSurveyReport(input: GenerateSurveyReportInput): Promise<GenerateSurveyReportOutput> {
    return generateSurveyReportFlow(input);
}
