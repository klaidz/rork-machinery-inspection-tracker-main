import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  // This is where you would get headers or auth info later
  console.log('Context created for request:', opts.req.url);
  
  return {
    // Add things here you want available in all routes (like db, auth user, etc.)
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;