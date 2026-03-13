import { spawn } from "node:child_process";
import { config } from "../config.js";
import { logger } from "../utils/logger.js";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
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
}

export async function askClaude(systemPrompt: string, userMessage: string): Promise<string> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`Calling Claude CLI (attempt ${attempt}/${MAX_RETRIES})...`);
      const result = await callClaude(systemPrompt, userMessage);

      if (!result) {
        throw new Error("No text response from Claude CLI");
      }

      logger.info("Claude response received");
      return result;
    } catch (err) {
      lastError = err as Error;
      logger.warn(`Claude CLI attempt ${attempt} failed: ${lastError.message}`);

      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        logger.info(`Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(`Claude CLI failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}
