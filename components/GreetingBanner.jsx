'use client';

export default function GreetingBanner({ name, stats, profile }) {
  const getRandomMessage = (messages) => {
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getDaysSinceLastActive = () => {
    if (!stats?.lastActiveDate) return Infinity;
    const lastActive = new Date(stats.lastActiveDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGreeting = () => {
    const userName = name || 'Student';
    const isNewUser = !stats || stats.totalAttempts === 0;
    const isActiveToday = stats?.todayQuestionsAnswered > 0;
    const isConsistent = (profile?.streak || 0) >= 3;
    const daysSinceActive = getDaysSinceLastActive();
    const isInactive = daysSinceActive > 1;
    const dailyGoal = profile?.dailyGoal || 15;
    const questionsToday = stats?.todayQuestionsAnswered || 0;
    const isCloseToGoal = questionsToday >= dailyGoal - 2 && questionsToday < dailyGoal;

    // Priority order: Inactive > Active Today > Close to Goal > Consistent > New User
    if (isInactive && !isNewUser) {
      return getRandomMessage([
        `Hey ${userName}, why the gap? Let's get back on track`,
        `Hi ${userName}, small step today makes a big difference`,
        `Welcome back ${userName}! Ready to continue your journey?`,
        `Hi ${userName}, let's rebuild that momentum together`
      ]);
    }

    if (isActiveToday) {
      return getRandomMessage([
        `Hi ${userName}, great job today! Keep going 🚀`,
        `Amazing work ${userName}! You're on fire today 🔥`,
        `Hi ${userName}, today's practice is going strong!`,
        `Great consistency ${userName}! Keep it up`
      ]);
    }

    if (isCloseToGoal) {
      return getRandomMessage([
        `Hi ${userName}, you are very close — finish strong 💪`,
        `Almost there ${userName}! Just ${dailyGoal - questionsToday} more to go`,
        `Hi ${userName}, push through to complete your goal!`,
        `${userName}, you're so close to today's target!`
      ]);
    }

    if (isConsistent && !isNewUser) {
      return getRandomMessage([
        `Hi ${userName}, I love your consistency 🔥`,
        `Hi ${userName}, you're doing great — keep it up!`,
        `Amazing consistency ${userName}! Keep the streak alive`,
        `${userName}, your dedication is inspiring!`
      ]);
    }

    if (isNewUser) {
      return getRandomMessage([
        `Hi ${userName}, welcome! Ready to start your maths journey?`,
        `Hi ${userName}, excited to help you master maths!`,
        `Welcome ${userName}! Let's begin your learning adventure`,
        `Hi ${userName}, ready to unlock your maths potential?`
      ]);
    }

    // Fallback
    return getRandomMessage([
      `Hi ${userName}, ready to practice today?`,
      `Hey ${userName}, let's make today count!`,
      `Hi ${userName}, time for some maths practice?`,
      `${userName}, ready to continue your progress?`
    ]);
  };

  const greeting = getGreeting();

  return (
    <div className="glass-card p-4 mb-6 bg-gradient-to-r from-primary-light to-blue-50 border-l-4 border-primary">
      <div className="flex items-center justify-center">
        <p className="text-lg font-semibold text-primary text-center">
          {greeting}
        </p>
      </div>
    </div>
  );
}
