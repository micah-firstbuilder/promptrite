import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { type Context } from '../../app/server/context';

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// Middleware to check if the user is authenticated
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});
// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
