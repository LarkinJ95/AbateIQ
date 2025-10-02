
'use server';

/**
 * @fileOverview An AI agent for generating comprehensive survey reports.
 *
 * CUSTOMIZATION AREA: This file is the central place to customize AI-generated reports.
 * 1. `GenerateSurveyReportInputSchema`: Defines all data available to the AI.
 *    To add new data to your report, add it here first.
 * 2. `reportOrchestratorPrompt`: This is the master prompt. It tells the AI *how*
 *    to structure the report and what data to include in each section by calling
 *    the `generateHtml` tool. You can reorder sections or change the instructions here.
 * 3. `generateHtml` (Tool) prompt: This prompt defines the HTML and CSS for each
 *    individual section of the report. To change styling (colors, fonts, layout) or the
 *    HTML structure of a specific component (like a table), modify the prompt for this tool.
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
  logoDataUri: z.string().optional(),
  primaryColor: z.string().optional().default('#00BFFF'), // Deep Sky Blue
  accentColor: z.string().optional().default('#708090'), // Slate Blue
  
  // Photos
  mainPhotoDataUri: z.string().optional(),
  floorPlanDataUri: z.string().optional(),
  positiveMaterialPhotoDataUris: z.array(z.string()).optional(),
});
export type GenerateSurveyReportInput = z.infer<typeof GenerateSurveyReportInputSchema>;


// The final output schema expected from the main exported function.
const GenerateSurveyReportOutputSchema = z.object({
  reportHtml: z.string().describe('The full survey report formatted as a single HTML string.'),
});
export type GenerateSurveyReportOutput = z.infer<typeof GenerateSurveyReportOutputSchema>;


// #################################################################################
// AI TOOLS (The building blocks for the report)
// #################################################################################

/**
 * CUSTOMIZATION AREA 3: HTML Generation Tool
 * This tool is responsible for generating the HTML and CSS for individual sections.
 * Modify the `prompt` string here to change styling (fonts, colors, table layouts)
 * or the HTML structure of the report components.
 */
const generateHtml = ai.defineTool(
  {
    name: 'generateHtml',
    description: 'Generates a single, styled HTML section for a survey report. Use this tool multiple times to build a complete report section by section.',
    inputSchema: z.object({
      section: z.enum([
        'fullReportWrapper',
        'coverPage',
        'executiveSummary',
        'introduction',
        'inspectionMethods',
        'functionalAreasSummary',
        'homogeneousAreasSummary',
        'asbestosResults',
        'paintResults',
        'floorPlan',
        'positiveMaterialPhotos',
        'conclusions',
        'disclaimer',
      ]),
      data: z.any().describe('A JSON object or string containing the data for this section. This will be provided by the orchestrator.'),
    }),
    outputSchema: z.string().describe('A single string of HTML representing the requested section.'),
  },
  async ({ section, data }, flow) => {
    // This is a simplified internal prompt. In a real application, you might have
    // different prompts for different sections for more control.
    
    // Combine the section-specific data with the overall flow input to ensure colors are available.
    const promptData = { ...flow.input, ...data };
    
    const { text } = await ai.generate({
      prompt: `
        You are an expert HTML and CSS developer creating a professional environmental survey report.
        Generate the HTML for the requested section only. Use the provided data.
        
        **Styling Rules:**
        - Font: Use Google's 'Inter' font.
        - Primary Color (for headers, table borders): ${promptData.primaryColor || '#00BFFF'}
        - Accent Color (for sub-headers): ${promptData.accentColor || '#708090'}
        - Use semantic HTML tags and well-structured tables. Photos should be responsive.
        
        **Section to Generate:** ${section}
        
        **Data for Section:**
        \`\`\`json
        ${JSON.stringify(promptData, null, 2)}
        \`\`\`

        **Instructions per section:**
        - **fullReportWrapper**: Create the full HTML document structure (\`<html><head>...<style>...</style></head><body>...</body></html>\`). The body should contain a placeholder comment \`<!-- REPORT_CONTENT -->\` where the other sections will be injected. Include all necessary CSS in the \`<style>\` tag.
        - **coverPage**: A visually distinct cover page with the main photo, report title, site name, address, job number, date, and company name/logo.
        - **introduction**: A brief intro paragraph.
        - **executiveSummary**: A high-level overview of findings. Mention if hazardous materials were found.
        - **inspectionMethods**: Include the provided text block verbatim.
        - **functionalAreasSummary**: A table for Functional Areas with columns: FA ID, Use, Length, Width, Height, Floor Area.
        - **homogeneousAreasSummary**: A table for Homogeneous Areas with columns: HA ID, Description, Linked FAs.
        - **asbestosResults**: A table for Asbestos Samples. Columns must be in this order: Sample #, HA ID, Location, Material, Result.
        - **paintResults**: Create a separate table for EACH analyte (e.g., "Lead Paint Sample Results"). Columns: Sample Location, Paint Color, Result (mg/kg), Result (% by weight). Calculate '% by weight' as (mg/kg) / 10000.
        - **floorPlan**: Display the floor plan image under a clear heading.
        - **positiveMaterialPhotos**: Display all provided photos in a gallery under a clear heading.
        - **conclusions**: Provide clear next steps based on the findings.
        - **disclaimer**: Include the provided disclaimer text, inserting the company name.

        Generate only the HTML for the requested section. Do not include \`<html>\` or \`<body>\` tags unless the section is 'fullReportWrapper'.
      `,
    });
    return text;
  }
);


// #################################################################################
// ORCHESTRATOR PROMPT (The "brains" of the operation)
// #################################################################################


// Define a schema for the data being passed to the prompt itself, including stringified fields
const ReportOrchestratorInputSchema = GenerateSurveyReportInputSchema.extend({
  stringifiedFunctionalAreas: z.string(),
  stringifiedHomogeneousAreas: z.string(),
  stringifiedAsbestosSamples: z.string(),
  stringifiedPaintSamples: z.string(),
});


/**
 * CUSTOMIZATION AREA 2: REPORT ORCHESTRATOR PROMPT
 * This prompt acts as the "director" for the report. It doesn't write HTML itself.
 * Instead, it calls the `generateHtml` tool for each section in the desired order.
 * To reorder the report, change the order of the tool calls in the prompt below.
 */
const reportOrchestratorPrompt = ai.definePrompt({
  name: 'reportOrchestratorPrompt',
  // The system prompt instructs the AI on its role and how to use the tools.
  system: `You are a report-building agent. Your task is to generate a complete hazardous material survey report by calling the 'generateHtml' tool for each required section, in the correct order.
  
  **Report Structure:**
  1.  Generate the main HTML wrapper first ('fullReportWrapper').
  2.  Then, generate each content section one by one:
      - Cover Page
      - Executive Summary
      - Introduction & Scope
      - Inspection Methods
      - Functional Areas Summary
      - Homogeneous Areas Summary
      - Asbestos Results Table
      - Paint Results Tables (one for each analyte)
      - Floor Plan / Sketch
      - Positive Material Photos
      - Conclusions & Recommendations
      - Disclaimer
  `,
  tools: [generateHtml],
  // The prompt itself provides the data context to the AI.
  prompt: `
    Generate the full report using the 'generateHtml' tool. Call the tool for each section using the provided data.

    **Report Data:**
    - Site & Survey Info: {{{siteName}}}, {{{address}}}, {{{surveyDate}}}, {{{inspector}}}, {{{jobNumber}}}, Survey Types: {{#each surveyType}}{{{this}}}{{/each}}
    - Company Info: {{{companyName}}}, Primary Color: {{{primaryColor}}}, Accent Color: {{{accentColor}}}
    - Functional Areas: {{{stringifiedFunctionalAreas}}}
    - Homogeneous Areas: {{{stringifiedHomogeneousAreas}}}
    - Asbestos Samples: {{{stringifiedAsbestosSamples}}}
    - Paint Samples: {{{stringifiedPaintSamples}}}
    - Photos: mainPhotoDataUri is available, floorPlanDataUri is available, positiveMaterialPhotoDataUris are available.
  `,
});


// #################################################################################
// EXPORTED FLOW (The main function called by the app)
// #################################################################################


/**
 * This is the main function that orchestrates the AI report generation.
 */
export async function generateSurveyReport(input: GenerateSurveyReportInput): Promise<GenerateSurveyReportOutput> {

  // 1. Prepare the input data for the AI.
  // We stringify complex data to ensure it's passed cleanly to the prompt.
  const promptInput = {
    ...input,
    stringifiedFunctionalAreas: JSON.stringify(input.functionalAreas),
    stringifiedHomogeneousAreas: JSON.stringify(input.homogeneousAreas),
    stringifiedAsbestosSamples: JSON.stringify(input.asbestosSamples),
    stringifiedPaintSamples: JSON.stringify(input.paintSamples),
  };
  
  // 2. Call the orchestrator prompt. This will trigger the AI to make a series of tool calls.
  const { actions } = await reportOrchestratorPrompt(promptInput);

  // 3. Process the tool calls to build the final report.
  let fullHtml = '';
  const contentSections: string[] = [];
  
  for (const action of actions) {
    if (action.tool === 'generateHtml') {
      const toolOutput = action.output as string;
      if (action.input.section === 'fullReportWrapper') {
        fullHtml = toolOutput; // This is the main HTML structure
      } else {
        contentSections.push(toolOutput); // These are the content pieces
      }
    }
  }

  // 4. Inject the content sections into the main HTML wrapper.
  if (fullHtml.includes('<!-- REPORT_CONTENT -->')) {
    fullHtml = fullHtml.replace('<!-- REPORT_CONTENT -->', contentSections.join('\n'));
  } else {
    // Fallback if the placeholder is missing
    fullHtml = `<html><body>${contentSections.join('\n')}</body></html>`;
  }
  
  // 5. Return the completed report.
  return { reportHtml: fullHtml };
}
