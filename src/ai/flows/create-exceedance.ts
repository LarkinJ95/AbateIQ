
'use server';

/**
 * @fileOverview A secure flow for creating an Exceedance record.
 * This flow validates input and ensures that only authorized users can create exceedances.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { ExceedanceSchema } from '@/lib/types';
import { getCurrentUser } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
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
    // Add auth policy to ensure only authenticated users can call this flow.
    auth: async (input, auth) => {
        if (!auth) {
            throw new Error("Not authenticated.");
        }
        // In a real app, you might check roles from custom claims:
        // if (auth.customClaims?.role !== 'admin' && auth.customClaims?.role !== 'editor') {
        //   throw new Error("Not authorized.");
        // }
    }
  },
  async (input, context) => {
    const auth = context.auth;
    if (!auth) {
      throw new Error("Authentication context not available.");
    }
    const orgId = auth.customClaims?.orgId;
    const ownerId = auth.uid;

    if (!orgId) {
        throw new Error("Organization ID not found in user claims.");
    }


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
