import { askClaude } from "./client.js";
import { DailySummary } from "../db/repositories/summaries.js";
import { DailyEntry } from "../db/repositories/entries.js";

const SYSTEM_PROMPT = `You are a professional work journal assistant. Generate a cohesive weekly summary from the user's daily summaries and any additional ad-hoc log entries.

Format the summary with these sections:
## Highlights
## Details
## Challenges

Rules:
- Write in first person
- Keep it under 400 words
- Synthesize across days — don't just list day-by-day
- Highlight patterns, themes, and overarching progress
- Include ad-hoc logs for extra context where relevant
- Focus on impact and growth`;

export async function generateWeeklySummary(
  weekStart: string,
  weekEnd: string,
  dailySummaries: DailySummary[],
  adhocEntries: DailyEntry[]
): Promise<string> {
  let content = `Weekly summary for ${weekStart} to ${weekEnd}\n\n`;

  content += "--- Daily Summaries ---\n\n";
  for (const ds of dailySummaries) {
    content += `### ${ds.date}\n${ds.summary}\n\n`;
  }

  if (adhocEntries.length > 0) {
    content += "--- Ad-hoc Logs ---\n\n";
    for (const e of adhocEntries) {
      content += `[${e.date}] ${e.answer}\n`;
    }
  }

  return askClaude(SYSTEM_PROMPT, content);
}
