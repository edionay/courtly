type CourtlyMarkProps = {
  className?: string;
};

export function CourtlyMark({ className = "" }: CourtlyMarkProps) {
  return (
    <span className={`courtly-mark ${className}`.trim()}>
      <svg
        aria-hidden="true"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
      >
        <rect x="2" y="2" width="28" height="28" rx="9" fill="currentColor" />
        <path
          d="M8 10H24V22H8V10ZM16 10V22M8 16H24"
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      <span>Courtly</span>
    </span>
  );
}
