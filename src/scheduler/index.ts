import cron from "node-cron";
import { Bot } from "grammy";
import { config } from "../config.js";
import { isWeekday } from "../utils/dates.js";
import { sendDailyPrompt, sendDailyReminder } from "./daily-prompt.js";
import { sendMonthlySummary } from "./monthly-summary.js";
import { logger } from "../utils/logger.js";

export function registerSchedulers(bot: Bot): void {
  const chatId = config.allowedUserId;

  // 18:00 weekdays — daily prompt
  cron.schedule("0 18 * * 1-5", () => {
    logger.info("Cron: daily prompt");
    sendDailyPrompt(bot, chatId);
  });

  // 18:30 weekdays — reminder if unanswered
  cron.schedule("30 18 * * 1-5", () => {
    logger.info("Cron: daily reminder check");
    sendDailyReminder(bot, chatId);
  });

  // 09:00 1st of month — monthly summary
  cron.schedule("0 9 1 * *", () => {
    logger.info("Cron: monthly summary");
    sendMonthlySummary(bot, chatId).catch((err) =>
      logger.error("Monthly summary cron failed", err)
    );
  });

  logger.info("Schedulers registered (daily 18:00/18:30 weekdays, monthly 1st 09:00)");
}
