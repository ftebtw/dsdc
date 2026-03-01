/**
 * Compute the 1-indexed week number for a date relative to a term start date.
 * Week 1 starts on the term start date. Each 7-day period increments the week.
 * Dates before term start are clamped to Week 1.
 */
export function getWeekNumber(termStartDate: string, dateStr: string): number {
  const start = new Date(`${termStartDate}T00:00:00`);
  const date = new Date(`${dateStr}T00:00:00`);
  const diffMs = date.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

/** Type label for display. */
export const resourceTypeLabel: Record<string, string> = {
  slides: "Slides",
  homework: "Homework",
  lesson_plan: "Lesson Plan",
  document: "Document",
  recording: "Recording",
  other: "Other",
};

/** Type icon for visual distinction like Google Classroom. */
export const resourceTypeIcon: Record<string, string> = {
  slides: "📊",
  homework: "📝",
  lesson_plan: "📋",
  document: "📄",
  recording: "🎥",
  other: "📎",
};

/** Sort priority: slides first, homework second, etc. */
export const resourceTypePriority: Record<string, number> = {
  slides: 0,
  lesson_plan: 1,
  homework: 2,
  document: 3,
  recording: 4,
  other: 5,
};
