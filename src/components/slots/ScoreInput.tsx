interface ScoreInputProps {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function ScoreInput({ value, disabled, onChange }: ScoreInputProps) {
  return (
    <input
      className="bracketo-score-input"
      type="number"
      min={0}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{ width: 36 }}
    />
  );
}
