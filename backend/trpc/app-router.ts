import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { executeQuery } from '../lib/db';

const t = initTRPC.create();

export const appRouter = t.router({
  // COMMAND 1: Get all fields
  getFields: t.procedure.query(async () => {
    console.log("Fetching fields...");
    const result = await executeQuery("SELECT * FROM Fields");
    return result;
  }),

  // COMMAND 2: Create a Field (We will connect this next)
  createField: t.procedure
    .input(z.object({
      name: z.string(),
      department: z.string(),
      area: z.number(),
      boundaryJSON: z.string(), // We send the shape as text
      centerLat: z.number(),
      centerLng: z.number()
    }))
    .mutation(async (req) => {
      const { name, department, area, boundaryJSON, centerLat, centerLng } = req.input;
      
      // Run the stored procedure we created in SQL
      await executeQuery(
        `EXEC sp_CreateField_WithExtras @Name=@p0, @Department=@p1, @CreatedBy='AppUser', @BoundaryJSON=@p2, @GatewayLat=@p3, @GatewayLng=@p4`,
        [name, department, boundaryJSON, centerLat, centerLng]
      );
      return { success: true };
    })
});

export type AppRouter = typeof appRouter;