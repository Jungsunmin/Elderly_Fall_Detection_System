export type HeaderStatusTone = "normal" | "danger";

export type HeaderProps = {
  title: string;
  statusLabel?: string;
  statusTone?: HeaderStatusTone;
  onMenuClick?: () => void;
  className?: string;
};

const toneStyles: Record<
  HeaderStatusTone,
  { wrap: string; dot: string; text: string }
> = {
  normal: {
    wrap: "border-[#28A745]/40 bg-[#E8F5E9]",
    dot: "bg-[#28A745]",
    text: "text-[#1e7e34]",
  },
  danger: {
    wrap: "border-red-300/60 bg-red-50",
    dot: "bg-red-600",
    text: "text-red-800",
  },
};

const MenuIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    className="text-neutral-800"
    aria-hidden
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const Header = ({
  title,
  statusLabel = "정상",
  statusTone = "normal",
  onMenuClick,
  className = "",
}: HeaderProps) => {
  const tone = toneStyles[statusTone];

  return (
    <header
      className={`sticky top-0 z-20 w-full border-b border-neutral-200 bg-white ${className}`}
    >
      <div className="relative flex h-14 items-center justify-between px-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-800 transition hover:bg-neutral-100 active:bg-neutral-200"
          aria-label="메뉴 열기"
        >
          <MenuIcon />
        </button>

        <h1 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[17px] font-bold text-black">
          {title}
        </h1>

        <div
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 ${tone.wrap}`}
          role="status"
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${tone.dot}`} aria-hidden />
          <span className={`text-[13px] font-medium leading-none ${tone.text}`}>
            {statusLabel}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;