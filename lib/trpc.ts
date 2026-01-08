import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
// FIX: Correct path to backend
import type { AppRouter } from '../../backend/trpc/app-router';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      // ⚠️ IMPORTANT: Replace 192.168.0.104 with your NEW IP from the terminal
      url: 'http://192.168.0.104:3000/trpc', 
    }),
  ],
});