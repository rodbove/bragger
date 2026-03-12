import { exec } from "node:child_process";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

export async function askClaude(systemPrompt: string, userMessage: string): Promise<string> {
  logger.info("Calling Claude CLI...");

  const result = await new Promise<string>((resolve, reject) => {
    const systemArg = systemPrompt.replace(/'/g, "'\\''");
    const userArg = userMessage.replace(/'/g, "'\\''");

    const cmd = `claude -p '${userArg}' --model '${config.claudeModel}' --system-prompt '${systemArg}' --max-turns 1 --output-format text`;

    exec(cmd, { maxBuffer: 1024 * 1024, timeout: 120_000, shell: "/bin/bash" }, (error, stdout, stderr) => {
      if (stderr) {
        logger.warn(`Claude CLI stderr: ${stderr}`);
      }
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
