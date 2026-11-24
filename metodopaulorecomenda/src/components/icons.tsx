type P = { size?: number; className?: string };

export const PlayIcon = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M8 5.5v13l10.5-6.5L8 5.5Z" fill="currentColor" />
  </svg>
);

export const ArrowUpRightIcon = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRightIcon = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M6 3.5L10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronLeftIcon = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M10 3.5L5.5 8 10 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SearchIcon = ({ size = 16, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className} aria-hidden="true">
    <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12.2 12.2L15.5 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const ListIcon = ({ size = 18, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className} aria-hidden="true">
    <path d="M6.5 4.5h9M6.5 9h9M6.5 13.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="3" cy="4.5" r="1" fill="currentColor" />
    <circle cx="3" cy="9" r="1" fill="currentColor" />
    <circle cx="3" cy="13.5" r="1" fill="currentColor" />
  </svg>
);

export const BellIcon = ({ size = 18, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M7 10a5 5 0 0110 0c0 5.8 2.5 7.5 2.5 7.5h-15S7 15.8 7 10Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10.3 20.5a1.9 1.9 0 003.4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const BellFilledIcon = ({ size = 18, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M7 10a5 5 0 0110 0c0 5.8 2.5 7.5 2.5 7.5h-15S7 15.8 7 10Z" fill="currentColor" />
    <path d="M10.3 20.5a1.9 1.9 0 003.4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </svg>
);

export const CheckIcon = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
