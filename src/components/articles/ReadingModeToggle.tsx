interface ReadingModeToggleProps {
  mode: "simple" | "technical";
  onModeChange: (mode: "simple" | "technical") => void;
}

export function ReadingModeToggle({ mode, onModeChange }: ReadingModeToggleProps) {
  return (
    <div className="flex items-center border border-divider overflow-hidden">
      <button
        onClick={() => onModeChange("simple")}
        className={`reading-mode-btn ${mode === "simple" ? "active" : ""}`}
      >
        Simple Explanation
      </button>
      <button
        onClick={() => onModeChange("technical")}
        className={`reading-mode-btn ${mode === "technical" ? "active" : ""}`}
      >
        Technical Breakdown
      </button>
    </div>
  );
}
