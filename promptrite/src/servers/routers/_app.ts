import { z } from 'zod';
import { procedure, router, protectedProcedure } from '../trpc';

export const appRouter = router({
  hello: procedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query(({ input, ctx }) => {
      const { userId, isAuthenticated } = ctx.auth;

      if (!isAuthenticated) {
        return {
          greeting: `hello ${input.text} (not signed in)`,
          authStatus: 'Not authenticated'
        };
      }

      return {
        greeting: `hello ${input.text}`,
        authStatus: 'Authenticated',
        userId
      };
    }),
    
  secretData: protectedProcedure.query(({ ctx }) => {
    return {
      message: 'This is protected data!',
      userId: ctx.auth.userId
    };
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
