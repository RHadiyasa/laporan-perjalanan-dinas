"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/docs", label: "Dokumentasi" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-sm shadow-teal-200 group-hover:shadow-teal-300 transition-shadow">
              <span className="text-white text-xs font-bold tracking-tight">V</span>
            </div>
            <div className="leading-tight">
              <p className="font-bold text-slate-800 text-sm">Visa · SPD Generator</p>
              <p className="text-xs text-slate-400 hidden sm:block">Kementerian ESDM</p>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  pathname === l.href
                    ? "text-teal-700 bg-teal-50 font-medium"
                    : "text-slate-600 hover:text-teal-600 hover:bg-slate-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/generate"
              className="ml-2 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-teal-200"
            >
              Mulai →
            </Link>
          </div>

          {/* Mobile: CTA + hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/generate"
              className="px-3.5 py-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 shadow-sm shadow-teal-200 active:scale-95 transition-all"
            >
              Mulai →
            </Link>
            <button
              aria-label={open ? "Tutup menu" : "Buka menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {open ? <XIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-14 left-0 right-0 z-40 sm:hidden bg-white border-b border-slate-100 shadow-xl transition-all duration-200 ease-out ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="px-4 py-3 space-y-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "text-teal-700 bg-teal-50"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {l.label}
              {pathname === l.href && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />
              )}
            </Link>
          ))}
          <div className="pt-1 pb-2">
            <Link
              href="/generate"
              className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 shadow-sm shadow-teal-200 active:scale-[0.98] transition-all"
            >
              Mulai Buat Laporan
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function MenuIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
