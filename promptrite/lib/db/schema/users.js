Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = exports.users = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
  id: (0, pg_core_1.text)("id").primaryKey().notNull(), // Clerk user id
  email: (0, pg_core_1.text)("email").notNull(),
  first_name: (0, pg_core_1.text)("first_name"),
  last_name: (0, pg_core_1.text)("last_name"),
  username: (0, pg_core_1.text)("username"),
  elo_rating: (0, pg_core_1.integer)("elo_rating").default(1200).notNull(), // ELO rating for ranking
  created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
  updated_at: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Legacy compatibility - export as Users for existing code
exports.Users = exports.users;
