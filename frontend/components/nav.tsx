"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/projects", label: "Projects" },
];

export function Nav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/75 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-1">
        <Link href="/" className="flex items-center gap-2 mr-5 group">
          <span className="h-6 w-6 rounded-md bg-gradient-to-br from-emerald-300 to-teal-400 shadow-sm transition-transform group-hover:scale-105" />
          <span className="text-base font-semibold tracking-tight">AdvisorPulse</span>
        </Link>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isActive(l.href)
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
