// Drapeaux en SVG : fiables sur tous les OS.

type FlagCode = 'fr' | 'gb';

const FRENCH_FLAG = (
  <svg viewBox="0 0 3 2" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="1" height="2" fill="#0055A4" />
    <rect x="1" width="1" height="2" fill="#fff" />
    <rect x="2" width="1" height="2" fill="#EF4135" />
  </svg>
);

const UK_FLAG = (
  <svg viewBox="0 0 60 30" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="60" height="30" fill="#012169" />
    <path d="M0,0 60,30 M60,0 0,30" stroke="#FFFFFF" strokeWidth="6" />
    <path d="M0,0 60,30 M60,0 0,30" stroke="#C8102E" strokeWidth="3" />
    <path d="M30,0 V30 M0,15 H60" stroke="#FFFFFF" strokeWidth="10" />
    <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
  </svg>
);

const FLAGS: Record<FlagCode, React.ReactNode> = {
  fr: FRENCH_FLAG,
  gb: UK_FLAG,
};

interface FlagProps {
  code: FlagCode;
  className?: string;
  rounded?: boolean;
}

export function Flag({ code, className = 'h-4 w-6', rounded = true }: FlagProps) {
  return (
    <span
      className={`inline-block shrink-0 overflow-hidden shadow-sm ring-1 ring-black/10 ${rounded ? 'rounded-[3px]' : ''} ${className}`}
    >
      {FLAGS[code] ?? FLAGS.gb}
    </span>
  );
}

export default Flag;