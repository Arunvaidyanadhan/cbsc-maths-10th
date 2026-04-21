export default function QuestionCard({ question, qIndex, total, selected, answered, onSelect, onNext }) {
  // Build options array from separate fields
  const options = [
    question.option1,
    question.option2,
    question.option3,
    question.option4,
  ];

  return (
    <div className="w-full">
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
              className={btnClass}
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

      {/* Next Button */}
      {answered && (
        <button
          onClick={onNext}
          className="next-btn"
        >
          {qIndex === total - 1 ? 'See Results →' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}
