import { spawn } from "node:child_process";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

export async function askClaude(systemPrompt: string, userMessage: string): Promise<string> {
  logger.info("Calling Claude CLI...");

  const result = await new Promise<string>((resolve, reject) => {
    const args = [
      "-p", "-",
      "--model", config.claudeModel,
      "--system-prompt", systemPrompt,
      "--max-turns", "1",
      "--output-format", "text",
    ];

    const proc = spawn("claude", args, {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 120_000,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => { stdout += data.toString(); });
    proc.stderr.on("data", (data: Buffer) => { stderr += data.toString(); });

    proc.on("error", (err) => {
      reject(new Error(`Claude CLI failed to start: ${err.message}`));
    });

    proc.on("close", (code) => {
      if (stderr) {
        logger.warn(`Claude CLI stderr: ${stderr}`);
      }
      if (code !== 0) {
        reject(new Error(`Claude CLI exited with code ${code}\n${stderr}`));
        return;
      }
      resolve(stdout.trim());
    });

    proc.stdin.write(userMessage);
    proc.stdin.end();
  });

  if (!result) {
    throw new Error("No text response from Claude CLI");
  }

  logger.info("Claude response received");
  return result;
}
