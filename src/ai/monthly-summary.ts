import { askClaude } from "./client.js";
import { WeeklySummary } from "../db/repositories/summaries.js";
import { DailyEntry } from "../db/repositories/entries.js";
import { monthName } from "../utils/dates.js";

const SYSTEM_PROMPT = `You are a professional work journal assistant. Generate a monthly brag document section in the style of Julia Evans.

Format the summary with these sections:
### Projects & Impact
### Challenges & Growth
### Technologies & Skills
### Collaboration

Rules:
- Write in first person
- Keep it under 600 words
- This is a "brag document" — highlight accomplishments confidently
- Be specific about impact and outcomes
- Organize by theme, not chronologically
- Include concrete examples and metrics where available
- Celebrate learning moments and problem-solving wins`;

export async function generateMonthlySummary(
  year: number,
  month: number,
  weeklySummaries: WeeklySummary[],
  allEntries: DailyEntry[]
): Promise<string> {
  let content = `Monthly brag document for ${monthName(month)} ${year}\n\n`;

  content += "--- Weekly Summaries ---\n\n";
  for (const ws of weeklySummaries) {
    content += `### Week of ${ws.week_start}\n${ws.summary}\n\n`;
  }

  if (allEntries.length > 0) {
    content += "--- Raw Entries (for additional context) ---\n\n";
    for (const e of allEntries) {
      const prefix = e.question_text ? `[${e.date}] Q: ${e.question_text} A: ` : `[${e.date}] `;
      content += `${prefix}${e.answer}\n`;
    }
  }

  return askClaude(SYSTEM_PROMPT, content);
}
