export default function Disclaimer({ text }: { text: string }) {
  return (
    <aside className="relative my-8 flex gap-4 overflow-hidden rounded-r-xl border-l-[3px] px-6 py-5 bg-blue-100/80 border-blue-400/80 dark:bg-blue-500/20 dark:border-blue-400 dark:shadow-[0_0_28px_rgba(59,130,246,0.14)]">
      <div
        className="mt-0.5 flex-shrink-0 text-blue-500 dark:text-blue-400"
        aria-hidden="true"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <rect
            x="7.25"
            y="6.5"
            width="1.5"
            height="5"
            rx="0.75"
            fill="currentColor"
          />
          <rect
            x="7.25"
            y="4"
            width="1.5"
            height="1.5"
            rx="0.75"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-sm leading-relaxed italic text-blue-950/80 dark:text-blue-100/80">
          {text}
        </p>
      </div>
    </aside>
  );
}
