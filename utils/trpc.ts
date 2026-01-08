import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../backend/trpc/app-router';

// This creates the "hook" we will use in every screen to ask for data
export const trpc = createTRPCReact<AppRouter>();