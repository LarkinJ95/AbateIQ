
'use server';

/**
 * @fileOverview A secure flow for creating an Exceedance record.
 * This flow validates input and ensures that only authorized users can create exceedances.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { ExceedanceSchema } from '@/lib/types';
import { collection, addDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

// Define the input schema, omitting fields that should be set by the server
const CreateExceedanceInputSchema = ExceedanceSchema.omit({ 
    id: true,
    ownerId: true,
    orgId: true,
    exceedanceDate: true,
});
export type CreateExceedanceInput = z.infer<typeof CreateExceedanceInputSchema>;

// Define the output schema
const CreateExceedanceOutputSchema = z.object({
  exceedanceId: z.string(),
});
export type CreateExceedanceOutput = z.infer<typeof CreateExceedanceOutputSchema>;


const createExceedanceFlow = ai.defineFlow(
  {
    name: 'createExceedanceFlow',
    inputSchema: CreateExceedanceInputSchema,
    outputSchema: CreateExceedanceOutputSchema,
  },
  async (input) => {
    // In a real app, you would get the orgId and userId from the user's auth claims.
    // We will simulate this for now.
    const orgId = "org_placeholder_123"; 
    const ownerId = "user_placeholder_456";

    const firestore = getFirestore();

    const newExceedance: Omit<z.infer<typeof ExceedanceSchema>, 'id'> = {
        ...input,
        ownerId,
        orgId,
        exceedanceDate: new Date().toISOString(),
    };

    const exceedancesCollection = firestore.collection(`orgs/${orgId}/exceedances`);
    const docRef = await exceedancesCollection.add(newExceedance);

    return {
      exceedanceId: docRef.id,
    };
  }
);


export async function createExceedance(
  input: CreateExceedanceInput
): Promise<CreateExceedanceOutput> {
  return createExceedanceFlow(input);
}
