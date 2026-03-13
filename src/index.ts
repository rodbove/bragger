import { bot } from "./bot.js";
import { initSchema } from "./db/schema.js";
import { startCommand } from "./commands/start.js";
import { logCommand } from "./commands/log.js";
import { todayCommand } from "./commands/today.js";
import { summaryCommand } from "./commands/summary.js";
import { weekCommand } from "./commands/week.js";
import { monthCommand } from "./commands/month.js";
import { exportCommand } from "./commands/export.js";
import { skipCommand } from "./commands/skip.js";
import { editCommand } from "./commands/edit.js";
import { deleteCommand } from "./commands/delete.js";
import { handleMessage } from "./conversation/handler.js";
import { registerSchedulers } from "./scheduler/index.js";
import { logger } from "./utils/logger.js";

// Initialize database
initSchema();

// Register commands
bot.command("start", startCommand);
bot.command("log", logCommand);
bot.command("today", todayCommand);
bot.command("summary", summaryCommand);
bot.command("week", weekCommand);
bot.command("month", monthCommand);
bot.command("export", exportCommand);
bot.command("skip", skipCommand);
bot.command("edit", editCommand);
bot.command("delete", deleteCommand);

// Handle free-text messages (conversation flow)
bot.on("message:text", handleMessage);

// Register scheduled jobs
registerSchedulers(bot);

// Start
bot.start({
  onStart: () => logger.info("Bragger bot is running!"),
});

// Graceful shutdown
process.on("SIGINT", () => {
  logger.info("Shutting down...");
  bot.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Shutting down...");
  bot.stop();
  process.exit(0);
});
