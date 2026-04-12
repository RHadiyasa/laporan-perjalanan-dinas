"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/",
    label: "Beranda",
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? "text-teal-600" : "text-slate-400"}`} fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: "/generate",
    label: "Upload",
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? "text-teal-600" : "text-slate-400"}`} fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    href: "/review",
    label: "Review",
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? "text-teal-600" : "text-slate-400"}`} fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    href: "/result",
    label: "Unduh",
    icon: (active: boolean) => (
      <svg className={`w-5 h-5 ${active ? "text-teal-600" : "text-slate-400"}`} fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
];

export function AppBottomBar() {
  const pathname = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-stretch h-16 safe-area-inset-bottom">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors active:scale-95 ${
                active ? "text-teal-600" : "text-slate-400"
              }`}
            >
              {tab.icon(active)}
              <span>{tab.label}</span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-gradient-to-r from-teal-500 to-blue-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
