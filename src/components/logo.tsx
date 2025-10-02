export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AbateIQ Logo"
    >
      <text
        x="0"
        y="30"
        fontFamily="Space Grotesk, sans-serif"
        fontSize="30"
        fontWeight="bold"
        className="fill-current text-foreground/80 dark:text-foreground/80"
      >
        Abate
      </text>
      <text
        x="98"
        y="30"
        fontFamily="Space Grotesk, sans-serif"
        fontSize="30"
        fontWeight="bold"
        className="fill-current text-primary"
      >
        IQ
      </text>
    </svg>
  );
}
