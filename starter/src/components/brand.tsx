// Coreloom's logo: the woven ginger cat (its head cut in three bands, the loom's weft) and the
// wordmark. Replace with your own logo. Artwork and usage rules: the design system's Logos assets.
export function Brand({ className }: { className?: string }) {
  return (
    <span className={"inline-flex items-center gap-2 " + (className ?? "")}>
      <CatMark className="size-7 shrink-0" />
      <span className="font-display text-[19px] font-bold tracking-[-0.03em] text-foreground">
        Core<span className="text-primary-text">loom</span>
      </span>
    </span>
  )
}

/** The symbol alone. Orange with cyan pupils on dark; a deeper orange with graphite pupils on light. */
export function CatMark({ className }: { className?: string }) {
  return (
    <svg viewBox="36 26 184 204" aria-hidden className={className}>
      <path
        fillRule="evenodd"
        className="fill-[#EF9140] [[data-theme=light]_&]:fill-[#C9611A]"
        d="M43.92 112 L60 30 L110 72 C120 70 136 70 146 72 L196 30 L212.08 112 Z M40 132 L41.57 124 L214.43 124 L216 132 C216 151.26 211.81 168.1 204.38 182 L51.62 182 C44.19 168.1 40 151.26 40 132 Z M196.61 194 C180.71 214.49 156.27 226 128 226 C99.73 226 75.29 214.49 59.39 194 Z M70.89 143.27 A36 36 0 0 1 121.11 156.73 A36 36 0 0 1 70.89 143.27 Z M134.89 156.73 A36 36 0 0 1 185.11 143.27 A36 36 0 0 1 134.89 156.73 Z"
      />
      <path className="fill-[#1CE0D3] [[data-theme=light]_&]:fill-[#15171C]" d="M96 139 A5 11 0 0 1 96 161 A5 11 0 0 1 96 139 Z M160 139 A5 11 0 0 1 160 161 A5 11 0 0 1 160 139 Z" />
    </svg>
  )
}
