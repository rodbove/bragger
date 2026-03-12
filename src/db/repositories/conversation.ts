import { db } from "../connection.js";

export interface ConversationState {
  chat_id: number;
  date: string;
  state: "idle" | "prompted" | "skipped_day";
  question_index: number;
  created_at: string;
  updated_at: string;
}

export function getConversationState(
  chatId: number,
  date: string
): ConversationState | undefined {
  return db
    .prepare(`SELECT * FROM conversation_state WHERE chat_id = ? AND date = ?`)
    .get(chatId, date) as ConversationState | undefined;
}

export function upsertConversationState(
  chatId: number,
  date: string,
  state: string,
  questionIndex: number
): void {
  db.prepare(
    `INSERT INTO conversation_state (chat_id, date, state, question_index)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(chat_id, date) DO UPDATE SET
       state = excluded.state,
       question_index = excluded.question_index,
       updated_at = datetime('now')`
  ).run(chatId, date, state, questionIndex);
}
