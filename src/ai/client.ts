import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

export async function askClaude(systemPrompt: string, userMessage: string): Promise<string> {
  logger.info("Calling Claude API...");
  const response = await anthropic.messages.create({
    model: config.claudeModel,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  logger.info("Claude response received");
  return textBlock.text;
}
