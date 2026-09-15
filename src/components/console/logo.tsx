export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="9" y="9" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <rect
        x="9"
        y="9"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        transform="rotate(45 16 16)"
      />
      <circle cx="16" cy="16" r="1.6" fill="currentColor" />
    </svg>
  );
}
