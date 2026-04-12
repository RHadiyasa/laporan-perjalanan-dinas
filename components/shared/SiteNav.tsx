"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-sm shadow-teal-200 group-hover:shadow-teal-300 transition-shadow">
            <span className="text-white text-xs font-bold tracking-tight">SPD</span>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-slate-800 text-sm">SPD Generator</p>
            <p className="text-xs text-slate-400 hidden sm:block">Kementerian ESDM</p>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              pathname === "/"
                ? "text-teal-700 bg-teal-50 font-medium"
                : "text-slate-600 hover:text-teal-600 hover:bg-slate-50"
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/docs"
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              pathname === "/docs"
                ? "text-teal-700 bg-teal-50 font-medium"
                : "text-slate-600 hover:text-teal-600 hover:bg-slate-50"
            }`}
          >
            Dokumentasi
          </Link>
          <Link
            href="/generate"
            className="ml-2 px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-teal-200"
          >
            Mulai →
          </Link>
        </div>
      </div>
    </nav>
  );
}
