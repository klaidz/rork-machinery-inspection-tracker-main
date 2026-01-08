import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { supabase } from '../../lib/supabase'; // Make sure this path points to your supabase.ts file!

const t = initTRPC.create();

export const dailyChecksRouter = t.router({
  // 1. GET Request: Fetch history
  getHistory: t.procedure.query(async () => {
    // We select '*' which gives us machine_id, status, notes, created_at
    const { data, error } = await supabase
      .from('daily_checks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
      throw new Error(error.message);
    }
    return data;
  }),

  // 2. POST Request: Submit a new check
  submit: t.procedure
    .input(z.object({
      machineId: z.string(),          // Frontend sends "machineId"
      status: z.enum(['Passed', 'Failed']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      console.log('📝 Saving to Supabase:', input);
      
      const { error } = await supabase
        .from('daily_checks')
        .insert({
          machine_id: input.machineId, // Map "machineId" -> "machine_id" column
          status: input.status,
          notes: input.notes,
        });

      if (error) {
        console.error('Error saving to DB:', error);
        throw new Error('Failed to save inspection');
      }

      return { success: true };
    }),
});