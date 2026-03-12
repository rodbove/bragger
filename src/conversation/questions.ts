export interface Question {
  index: number;
  text: string;
  category: string;
}

export const questions: Question[] = [
  {
    index: 0,
    text: "What did you work on today? What was the main focus?",
    category: "focus",
  },
  {
    index: 1,
    text: "Did you finish or make progress on anything notable?",
    category: "progress",
  },
  {
    index: 2,
    text: "Did you learn anything new or solve a tricky problem?",
    category: "learning",
  },
  {
    index: 3,
    text: "Did you help anyone or collaborate with others?",
    category: "collaboration",
  },
  {
    index: 4,
    text: "Anything else worth remembering about today?",
    category: "other",
  },
];

export const TOTAL_QUESTIONS = questions.length;
