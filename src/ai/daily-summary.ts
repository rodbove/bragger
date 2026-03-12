import { askClaude } from "./client.js";
import { DailyEntry } from "../db/repositories/entries.js";

const SYSTEM_PROMPT = `You are a professional work journal assistant. Generate a concise daily summary of the user's work accomplishments.

Rules:
- Write in first person
- Use bullet points
- Keep it under 200 words
- Focus on impact and outcomes, not just activities
- Be specific and concrete
- Group related items together
- If entries mention learning or problem-solving, highlight the insight gained`;

export async function generateDailySummary(
  date: string,
  entries: DailyEntry[]
): Promise<string> {
  const entriesText = entries
    .map((e) => {
      const prefix = e.question_text ? `Q: ${e.question_text}\nA: ` : "[Ad-hoc log] ";
      return `${prefix}${e.answer}`;
    })
    .join("\n\n");

  const userMessage = `Here are my work entries for ${date}:\n\n${entriesText}\n\nPlease generate a polished daily summary.`;

  return askClaude(SYSTEM_PROMPT, userMessage);
}
