import { TOTAL_QUESTIONS } from "./questions.js";

export interface State {
  state: "idle" | "prompted" | "skipped_day";
  questionIndex: number;
}

export interface Transition {
  newState: State;
  action: "save_and_advance" | "skip_question" | "skip_day" | "complete" | "none";
}

export function initialState(): State {
  return { state: "idle", questionIndex: 0 };
}

export function promptedState(): State {
  return { state: "prompted", questionIndex: 0 };
}

export function transition(current: State, userMessage: string): Transition {
  if (current.state !== "prompted") {
    return { newState: current, action: "none" };
  }

  const trimmed = userMessage.trim().toLowerCase();

  // Skip entire day
  if (trimmed === "skip") {
    return {
      newState: { state: "skipped_day", questionIndex: current.questionIndex },
      action: "skip_day",
    };
  }

  // Skip individual question
  if (trimmed === "-") {
    const nextIndex = current.questionIndex + 1;
    if (nextIndex >= TOTAL_QUESTIONS) {
      return {
        newState: { state: "idle", questionIndex: nextIndex },
        action: "complete",
      };
    }
    return {
      newState: { state: "prompted", questionIndex: nextIndex },
      action: "skip_question",
    };
  }

  // Normal answer
  const nextIndex = current.questionIndex + 1;
  if (nextIndex >= TOTAL_QUESTIONS) {
    return {
      newState: { state: "idle", questionIndex: nextIndex },
      action: "complete",
    };
  }
  return {
    newState: { state: "prompted", questionIndex: nextIndex },
    action: "save_and_advance",
  };
}

export function isInPromptedState(current: State): boolean {
  return current.state === "prompted" && current.questionIndex < TOTAL_QUESTIONS;
}
