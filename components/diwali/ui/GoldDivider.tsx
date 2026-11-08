type GoldDividerProps = {
  className?: string;
};

export default function GoldDivider({ className = "" }: GoldDividerProps) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center gap-3 text-gold-300/80 ${className}`}
    >
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-400/70 sm:w-20" />
      <svg
        width="30"
        height="14"
        viewBox="0 0 30 14"
        fill="none"
        className="shrink-0"
      >
        <path d="M15 1.5 17.6 7 15 12.5 12.4 7Z" stroke="currentColor" />
        <circle cx="4.5" cy="7" r="1.3" fill="currentColor" />
        <circle cx="25.5" cy="7" r="1.3" fill="currentColor" />
      </svg>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-400/70 sm:w-20" />
    </div>
  );
}
