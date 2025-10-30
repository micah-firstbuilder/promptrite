import { router } from "../trpc";
import { challengesRouter } from "./challenges";
import { chatRouter } from "./chat";
import { profileRouter } from "./profile";
import { progressRouter } from "./progress";
import { scoringRouter } from "./scoring";
import { toolsRouter } from "./tools";
import { userRouter } from "./user";

export const appRouter = router({
  user: userRouter,
  progress: progressRouter,
  profile: profileRouter,
  challenges: challengesRouter,
  scoring: scoringRouter,
  chat: chatRouter,
  tools: toolsRouter,
});

export type AppRouter = typeof appRouter;
