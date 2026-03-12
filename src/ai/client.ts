import { execFile } from "node:child_process";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

export async function askClaude(systemPrompt: string, userMessage: string): Promise<string> {
  logger.info("Calling Claude CLI...");

  const result = await new Promise<string>((resolve, reject) => {
    const args = [
      "-p", userMessage,
      "--model", config.claudeModel,
      "--system-prompt", systemPrompt,
      "--max-turns", "1",
      "--output-format", "text",
    ];

    execFile("claude", args, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Claude CLI failed: ${error.message}\n${stderr}`));
        return;
      }
      resolve(stdout.trim());
    });
  });

  if (!result) {
    throw new Error("No text response from Claude CLI");
  }

  logger.info("Claude response received");
  return result;
}
