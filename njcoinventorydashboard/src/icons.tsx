import type { ReactNode } from 'react';

export interface IconProps {
  size?: number;
  className?: string;
}

function mk(paths: ReactNode) {
  return ({ size, className }: IconProps = {}) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={size ? { width: size, height: size } : undefined}
    >
      {paths}
    </svg>
  );
}

export const Icons = {
  dashboard: mk(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>),
  products: mk(<><path d="M20.6 7.5 12 12 3.4 7.5" /><path d="M12 12v9" /><path d="m3.4 7.5 8.6-4.5 8.6 4.5v9L12 21 3.4 16.5Z" /></>),
  inventory: mk(<><path d="M21 8V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" /><path d="M2 4h20v4H2z" /><path d="M10 12h4" /></>),
  sales: mk(<><path d="M3 3h2l2.4 12.3a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L22 7H6" /><circle cx="9.5" cy="20" r="1.3" /><circle cx="18" cy="20" r="1.3" /></>),
  lowstock: mk(<><path d="M10.3 3.8 1.9 18a1.5 1.5 0 0 0 1.3 2.3h17.6a1.5 1.5 0 0 0 1.3-2.3L13.7 3.8a1.5 1.5 0 0 0-2.6 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>),
  outstock: mk(<><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6 18.4 18.4" /></>),
  settings: mk(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.5 1.5 0 0 0 .3 1.6l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.5 1.5 0 0 0-2.5 1V21a2 2 0 0 1-4 0v-.1a1.5 1.5 0 0 0-2.5-1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.5 1.5 0 0 0 5 15H4.8a2 2 0 0 1 0-4H5a1.5 1.5 0 0 0 1-2.5l-.1-.1A2 2 0 1 1 8.7 5.6l.1.1A1.5 1.5 0 0 0 11 5.8V5a2 2 0 0 1 4 0v.1a1.5 1.5 0 0 0 2.5 1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.5 1.5 0 0 0 1 2.5h.2a2 2 0 0 1 0 4H21Z" /></>),
  search: mk(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>),
  bell: mk(<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>),
  plus: mk(<><path d="M12 5v14" /><path d="M5 12h14" /></>),
  filter: mk(<><path d="M3 5h18l-7 8v6l-4-2v-4Z" /></>),
  eye: mk(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>),
  edit: mk(<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>),
  sell: mk(<><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /><path d="M5 6 6 21h12l1-15" /></>),
  restock: mk(<><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></>),
  trash: mk(<><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" /><path d="M10 11v6M14 11v6" /></>),
  chevdown: mk(<><path d="m6 9 6 6 6-6" /></>),
  x: mk(<><path d="M18 6 6 18M6 6l12 12" /></>),
  menu: mk(<><path d="M3 6h18M3 12h18M3 18h18" /></>),
  upload: mk(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 9l5-5 5 5" /><path d="M12 4v12" /></>),
  box: mk(<><path d="m3.4 7.5 8.6 4.5 8.6-4.5" /><path d="M12 12v9" /><path d="m3.4 7.5 8.6-4.5 8.6 4.5v9L12 21 3.4 16.5Z" /></>),
  coins: mk(<><ellipse cx="9" cy="6" rx="6" ry="2.5" /><path d="M3 6v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V6" /><path d="M3 11v5c0 1.4 2.7 2.5 6 2.5" /><path d="M15 13.5c3.3 0 6-1.1 6-2.5" /><path d="M15 13.5v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5" /><ellipse cx="18" cy="11" rx="3" ry="0" /></>),
  tag: mk(<><path d="M3 8.6V4a1 1 0 0 1 1-1h4.6a1 1 0 0 1 .7.3l10.4 10.4a1 1 0 0 1 0 1.4l-4.6 4.6a1 1 0 0 1-1.4 0L3.3 9.3a1 1 0 0 1-.3-.7Z" /><circle cx="7.5" cy="7.5" r="1.3" /></>),
  arrowright: mk(<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>),
  check: mk(<><path d="M20 6 9 17l-5-5" /></>),
  calendar: mk(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>),
  image: mk(<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>),
  target: mk(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" /></>),
  trophy: mk(<><path d="M7 4h10v4a5 5 0 0 1-10 0Z" /><path d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5C3 10 5 11 7 11" /><path d="M17 6h2.5A1.5 1.5 0 0 1 21 7.5C21 10 19 11 17 11" /><path d="M12 13v3" /><path d="M9 20h6" /><path d="M10 16h4l-.5 4h-3Z" /></>),
  clock: mk(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  trend: mk(<><path d="M3 17l6-6 4 4 7-7" /><path d="M17 8h4v4" /></>),
  peso: mk(<><path d="M7 4h5a4 4 0 0 1 0 8H7" /><path d="M7 4v16" /><path d="M4 9h9M4 13h9" /></>),
  grid: mk(<><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></>),
};

export type IconName = keyof typeof Icons;

export function Icon({ name, size, className }: IconProps & { name: IconName }) {
  const C = Icons[name];
  return <C size={size} className={className} />;
}
