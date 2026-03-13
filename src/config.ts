import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const config = {
  telegramBotToken: required("TELEGRAM_BOT_TOKEN"),
  allowedUserId: Number(required("TELEGRAM_ALLOWED_USER_ID")),
  claudeModel: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
  tz: process.env.TZ || "America/Sao_Paulo",
  dailyPromptHour: Number(process.env.DAILY_PROMPT_HOUR || "18"),
  dailyPromptMinute: Number(process.env.DAILY_PROMPT_MINUTE || "0"),
  dailyReminderMinutes: Number(process.env.DAILY_REMINDER_AFTER || "30"),
} as const;
