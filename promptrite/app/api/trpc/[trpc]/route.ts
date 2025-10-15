import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '../../../../src/servers/routers/_app';
import { type NextRequest } from 'next/server';
import { createContext } from '../../../server/context';

// Export API handler for GET and POST
export const GET = async (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });
};

export const POST = async (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });
};
