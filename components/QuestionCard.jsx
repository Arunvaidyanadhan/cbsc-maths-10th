export default function QuestionCard({ question, qIndex, total, selected, answered, onSelect, onNext, onSubmit }) {
  if (!question) {
    return (
      <div className="p-4 bg-red-100 text-red-600 rounded-lg">
        <p>Error: Question data is missing or invalid.</p>
      </div>
    );
  }

  // Build options array from separate fields
  const options = [
    question.option1,
    question.option2,
    question.option3,
    question.option4,
  ];

  const isLastQuestion = qIndex === total - 1;
  const handleClick = isLastQuestion ? onSubmit : onNext;

  return (
    <div className="w-full practice-question-card">
      {/* Question Number Pill */}
      <div className="practice-q-pill">
        Question {qIndex + 1} of {total}
      </div>

      {/* Question Text */}
      <p className="practice-question">
        {question.text}
      </p>

      {/* Options */}
      <div className="options-list">
        {options.map((option, index) => {
          const isSelected = selected === index;
          const isCorrect = index === question.correctIndex;

          let btnClass = 'option-btn';

          if (answered) {
            if (isCorrect) {
              btnClass += ' correct';
            } else if (isSelected && !isCorrect) {
              btnClass += ' wrong';
            } else {
              btnClass += ' dimmed';
            }
          } else if (isSelected) {
            btnClass += ' selected';
          }

          return (
            <button
              key={index}
              onClick={() => !answered && onSelect(index)}
              disabled={answered}
              className={`${btnClass} bg-white/30 backdrop-blur-md shadow-md hover:shadow-lg transition-all`}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div className="explanation-box">
          <div className="explanation-label">Explanation</div>
          <div className="explanation-text">{question.explanation}</div>
        </div>
      )}

      {/* Next/Submit Button */}
      {answered && (
        <button
          onClick={handleClick}
          className="next-btn"
        >
          {isLastQuestion ? 'See Results →' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}
