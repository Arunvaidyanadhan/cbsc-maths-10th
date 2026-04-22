const ProgressRing = ({ pct }) => {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="progress-ring-wrap">
      <svg width="36" height="36" viewBox="0 0 36 36">
        <circle className="progress-ring-bg" cx="18" cy="18" r={r} />
        <circle
          className="progress-ring-fill"
          cx="18"
          cy="18"
          r={r}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="progress-ring-pct">{pct}%</span>
    </div>
  );
};

export default ProgressRing;
