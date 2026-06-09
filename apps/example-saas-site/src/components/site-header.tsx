import Link from "next/link";
import { navItems } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-b border-[#d9ddd5] bg-white/86 backdrop-blur">
      <div className="site-shell flex h-16 items-center justify-between gap-5">
        <Link className="text-lg font-bold tracking-tight text-[#17201d]" href="/">
          AcmeFlow
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-[#42504a] md:flex" aria-label="Main">
          {navItems.map((item) => (
            <Link className="hover:text-[#176b53]" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="rounded-md bg-[#176b53] px-4 py-2 text-sm font-semibold text-white" href="/demo">
          Book demo
        </Link>
      </div>
    </header>
  );
}

