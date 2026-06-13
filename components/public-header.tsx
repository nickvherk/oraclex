import Link from "next/link";

import { OracleXLogoMark } from "@/components/oraclex-logo-mark";

const DOCS_URL = "https://oracle-x-2.gitbook.io/oraclex-documentation/";

const navLinks = [
  { label: "Product", href: "/" },
  { label: "Why OracleX", href: "/why-oraclex" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: DOCS_URL, external: true },
];

export function PublicHeader() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.075] bg-black/62 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="cursor-pointer flex items-center gap-2.5 text-sm font-semibold tracking-[-0.01em] text-white">
          <OracleXLogoMark className="size-8 sm:size-9" />
          OracleX
        </Link>
        <div className="hidden items-center gap-8 text-xs font-medium text-slate-400 md:flex">
          {navLinks.map((link) =>
            link.external ? (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="cursor-pointer transition duration-300 hover:text-blue-100">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href} className="cursor-pointer transition duration-300 hover:text-blue-100">
                {link.label}
              </Link>
            ),
          )}
        </div>
        <Link href="/login?redirect=/terminal" className="premium-interactive hidden rounded-xl border border-blue-300/28 bg-blue-300/[0.055] px-4 py-2.5 text-xs font-semibold text-blue-100 sm:inline-flex">
          Enter Terminal
        </Link>
      </div>
    </nav>
  );
}
