import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";

export function Navigation() {
  return (
    <header className="border-b border-slate-200 bg-white/86 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link className="flex items-center gap-2 font-semibold text-slate-950" href="/">
          <span className="grid size-8 place-items-center rounded-md bg-slate-950 text-white">
            <Layers size={17} aria-hidden="true" />
          </span>
          AgentLayer
        </Link>
        <nav className="flex items-center gap-1 text-sm text-slate-600">
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-slate-950" href="/docs">
            Docs
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100 hover:text-slate-950" href="/demo">
            Demo
          </Link>
          <Link
            className="ml-1 inline-flex items-center gap-2 rounded-md bg-slate-950 px-3 py-2 font-medium text-white hover:bg-slate-800"
            href="/scan"
          >
            Scan
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
