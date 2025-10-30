Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = exports.submissions = exports.challenges = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var users_1 = require("./users");
exports.challenges = (0, pg_core_1.pgTable)("challenges", {
  id: (0, pg_core_1.serial)("id").primaryKey(),
  title: (0, pg_core_1.varchar)("title", { length: 255 }).notNull(),
  description: (0, pg_core_1.text)("description").notNull(),
  goals: (0, pg_core_1.jsonb)("goals").$type().notNull(), // Array of goal objects with criteria
  difficulty: (0, pg_core_1.varchar)("difficulty", { length: 50 })
    .default("medium")
    .notNull(), // 'easy', 'medium', 'hard'
  category: (0, pg_core_1.varchar)("category", { length: 100 }).notNull(),
  is_active: (0, pg_core_1.integer)("is_active").default(1).notNull(), // 1 = active, 0 = inactive
  created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.submissions = (0, pg_core_1.pgTable)("submissions", {
  id: (0, pg_core_1.serial)("id").primaryKey(),
  user_id: (0, pg_core_1.text)("user_id")
    .notNull()
    .references(() => users_1.users.id, { onDelete: "cascade" }),
  challenge_id: (0, pg_core_1.integer)("challenge_id")
    .notNull()
    .references(() => exports.challenges.id, { onDelete: "cascade" }),
  prompt: (0, pg_core_1.text)("prompt").notNull(), // User's submitted prompt/response
  type: (0, pg_core_1.varchar)("type", { length: 50 })
    .default("text")
    .notNull(), // 'text', 'code', etc.
  score: (0, pg_core_1.integer)("score").notNull().default(0), // Performance score
  metadata: (0, pg_core_1.jsonb)("metadata"), // Additional submission data
  created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// Legacy compatibility - export as Progress for existing code
exports.Progress = exports.submissions;
