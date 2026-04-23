"use client";

import * as React from "react";

type IconProps = { size?: number; style?: React.CSSProperties; className?: string };

const make = (children: React.ReactNode) =>
  function IconComp({ size = 18, style, className }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        className={className}
        suppressHydrationWarning
      >
        {children}
      </svg>
    );
  };

export const Icon = {
  map: make(<><path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 7 9 4Z"/><path d="M9 4v13"/><path d="M15 7v12.5"/></>),
  users: make(<><circle cx="9" cy="8" r="3.2"/><path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 6.5a3 3 0 0 1 0 5.7"/><path d="M21 19a5.5 5.5 0 0 0-3.5-5.1"/></>),
  box: make(<><path d="M12 3 3.5 7.5v9L12 21l8.5-4.5v-9L12 3Z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5"/><path d="M12 12v9"/></>),
  video: make(<><rect x="3" y="6" width="13" height="12" rx="2"/><path d="m16 10 5-3v10l-5-3"/></>),
  alert: make(<><path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v5"/><circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none"/></>),
  bell: make(<><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16Z"/><path d="M10 20a2 2 0 0 0 4 0"/></>),
  search: make(<><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></>),
  plus: make(<path d="M12 5v14M5 12h14"/>),
  chevronR: make(<path d="m10 6 6 6-6 6"/>),
  close: make(<path d="M6 6l12 12M18 6 6 18"/>),
  phone: make(<path d="M4.5 5.5c0 7.7 6.3 14 14 14l1.5-3-4-2-2 1.8c-2.6-1.2-4.6-3.2-5.8-5.8L10 8.5l-2-4-3.5 1Z"/>),
  mail: make(<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></>),
  truck: make(<><path d="M3 16V6.5h11V16"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></>),
  star: make(<path d="m12 4 2.5 5.3 5.8.6-4.3 4 1.2 5.7L12 16.9 6.8 19.6 8 13.9 3.7 9.9l5.8-.6L12 4Z"/>),
  filter: make(<path d="M4 5h16l-6 8v5l-4 2v-7L4 5Z"/>),
  calendar: make(<><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17"/><path d="M8 3v4M16 3v4"/></>),
  logout: make(<><path d="M10 4H5v16h5"/><path d="M14 8l4 4-4 4"/><path d="M18 12H9"/></>),
  moon: make(<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"/>),
  sun: make(<><circle cx="12" cy="12" r="3.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></>),
  sidebar: make(<><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M9 5v14"/></>),
  gear: make(<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></>),
  sparkle: make(<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>),
  edit: make(<><path d="M4 20h4l10-10-4-4L4 16v4Z"/><path d="m14 6 4 4"/></>),
  check: make(<path d="m5 12.5 4.5 4.5L19 7"/>),
  pin: make(<><path d="M12 21c-4-5-6-8-6-11a6 6 0 1 1 12 0c0 3-2 6-6 11Z"/><circle cx="12" cy="10" r="2.4"/></>),
  clock: make(<><circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2.5"/></>),
  license: make(<><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M13 10h5M13 14h4"/></>),
  globe: make(<><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.7 4 6 4 8.5s-1.5 5.8-4 8.5c-2.5-2.7-4-6-4-8.5s1.5-5.8 4-8.5Z"/></>),
  help: make(<><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 .3c0 1.5-2 1.7-2.5 3"/><circle cx="12" cy="16.5" r="0.5" fill="currentColor" stroke="none"/></>),
};

export type IconName = keyof typeof Icon;
