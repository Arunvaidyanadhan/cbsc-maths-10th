const messages = [
  "Consistency beats last-minute stress",
  "Future you will thank today's effort",
  "Small steps daily = big success",
  "Stay in rhythm. You're improving",
  "10 questions today. Confidence tomorrow",
];

export function getDailyMessage() {
  const dayIndex = new Date().getDate() % messages.length;
  return messages[dayIndex];
}
