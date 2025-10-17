import { router } from "../trpc";
import { userRouter } from "./user";
import { progressRouter } from "./progress";
import { profileRouter } from "./profile";
import { challengesRouter } from "./challenges";

export const appRouter = router({
  user: userRouter,
  progress: progressRouter,
  profile: profileRouter,
  challenges: challengesRouter,
});

export type AppRouter = typeof appRouter;


