Object.defineProperty(exports, "__esModule", { value: true });
exports.BaselineMetrics = exports.baselineMetrics = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var users_1 = require("./users");
exports.baselineMetrics = (0, pg_core_1.pgTable)("baseline_metrics", {
  id: (0, pg_core_1.serial)("id").primaryKey(),
  user_id: (0, pg_core_1.text)("user_id")
    .notNull()
    .references(() => users_1.users.id, { onDelete: "cascade" }),
  metric_type: (0, pg_core_1.text)("metric_type").notNull(), // 'elo', 'completion_rate', 'streak', etc.
  value: (0, pg_core_1.integer)("value").notNull(),
  baseline_value: (0, pg_core_1.integer)("baseline_value"), // Initial value when tracking started
  improvement_percentage: (0, pg_core_1.integer)(
    "improvement_percentage"
  ).default(0),
  created_at: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// Legacy compatibility - export as BaselineMetrics for existing code
exports.BaselineMetrics = exports.baselineMetrics;
