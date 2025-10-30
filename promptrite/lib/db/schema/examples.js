Object.defineProperty(exports, "__esModule", { value: true });
exports.examples = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var challenges_1 = require("./challenges");
var users_1 = require("./users");
exports.examples = (0, pg_core_1.pgTable)("examples", {
  id: (0, pg_core_1.serial)("id").primaryKey(),
  challenge_id: (0, pg_core_1.integer)("challenge_id")
    .notNull()
    .references(() => challenges_1.challenges.id, { onDelete: "cascade" }),
  parent_id: (0, pg_core_1.integer)("parent_id").references(
    () => exports.examples.id,
    {
      onDelete: "cascade",
    }
  ),
  content: (0, pg_core_1.text)("content").notNull(),
  created_by: (0, pg_core_1.text)("created_by").references(
    () => users_1.users.id,
    {
      onDelete: "set null",
    }
  ),
  is_flagged: (0, pg_core_1.boolean)("is_flagged").notNull().default(false),
  created_at: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
});
