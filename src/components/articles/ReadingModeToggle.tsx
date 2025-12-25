interface ReadingModeToggleProps {
  mode: "standard" | "simple" | "technical";
  onModeChange: (mode: "standard" | "simple" | "technical") => void;
}

export function ReadingModeToggle({ mode, onModeChange }: ReadingModeToggleProps) {
  return (
    <div className="flex items-center border border-divider overflow-hidden">
      <button
        onClick={() => onModeChange("standard")}
        className={`reading-mode-btn ${mode === "standard" ? "active" : ""}`}
      >
        Standard
      </button>
      <button
        onClick={() => onModeChange("simple")}
        className={`reading-mode-btn ${mode === "simple" ? "active" : ""}`}
      >
        Simple
      </button>
      <button
        onClick={() => onModeChange("technical")}
        className={`reading-mode-btn ${mode === "technical" ? "active" : ""}`}
      >
        Technical
      </button>
    </div>
  );
}
