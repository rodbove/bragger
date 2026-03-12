import "dotenv/config";

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const config = {
  telegramBotToken: required("TELEGRAM_BOT_TOKEN"),
  allowedUserId: Number(required("TELEGRAM_ALLOWED_USER_ID")),
  anthropicApiKey: required("ANTHROPIC_API_KEY"),
  claudeModel: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
  tz: process.env.TZ || "America/Sao_Paulo",
} as const;
