import cron from "node-cron";
import { Bot } from "grammy";
import { config } from "../config.js";
import { sendDailyPrompt, sendDailyReminder, sendWeeklySummary } from "./daily-prompt.js";
import { sendMonthlySummary } from "./monthly-summary.js";
import { logger } from "../utils/logger.js";

export function registerSchedulers(bot: Bot): void {
  const chatId = config.allowedUserId;
  const { dailyPromptHour, dailyPromptMinute, dailyReminderMinutes } = config;

  const reminderMinute = dailyPromptMinute + dailyReminderMinutes;
  const reminderHour = dailyPromptHour + Math.floor(reminderMinute / 60);
  const reminderMin = reminderMinute % 60;

  // Weekdays — daily prompt
  cron.schedule(`${dailyPromptMinute} ${dailyPromptHour} * * 1-5`, () => {
    logger.info("Cron: daily prompt");
    sendDailyPrompt(bot, chatId);
  });

  // Weekdays — reminder if unanswered
  cron.schedule(`${reminderMin} ${reminderHour} * * 1-5`, () => {
    logger.info("Cron: daily reminder check");
    sendDailyReminder(bot, chatId);
  });

  // Friday 20:00 — weekly summary (fallback if not triggered by daily completion)
  cron.schedule("0 20 * * 5", () => {
    logger.info("Cron: weekly summary");
    sendWeeklySummary(bot, chatId).catch((err) =>
      logger.error("Weekly summary cron failed", err)
    );
  });

  // 09:00 1st of month — monthly summary
  cron.schedule("0 9 1 * *", () => {
    logger.info("Cron: monthly summary");
    sendMonthlySummary(bot, chatId).catch((err) =>
      logger.error("Monthly summary cron failed", err)
    );
  });

  logger.info(
    `Schedulers registered (daily ${dailyPromptHour}:${String(dailyPromptMinute).padStart(2, "0")}/${reminderHour}:${String(reminderMin).padStart(2, "0")} weekdays, weekly Fri 20:00, monthly 1st 09:00)`
  );
}
