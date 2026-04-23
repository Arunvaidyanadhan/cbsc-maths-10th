export function getDaysLeft() {
  const examDate = new Date('2027-03-01T00:00:00');
  const today = new Date();

  // Reset time to avoid timezone issues
  today.setHours(0, 0, 0, 0);

  const diffTime = examDate - today;
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return daysLeft > 0 ? daysLeft : 0;
}
