import Link from "next/link";

const links = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact sales" },
  { href: "/support", label: "Support" }
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[#d9ddd5] bg-white">
      <div className="site-shell grid gap-6 py-8 text-sm text-[#5e6b66] md:grid-cols-[1fr_auto]">
        <div>
          <p className="font-semibold text-[#17201d]">AcmeFlow</p>
          <p className="mt-2 max-w-xl">
            AcmeFlow is a fictional B2B SaaS fixture used by AgentLayer tests and demos. The data on this site is
            intentionally public and non-sensitive.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4" aria-label="Footer">
          {links.map((link) => (
            <Link className="hover:text-[#176b53]" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

