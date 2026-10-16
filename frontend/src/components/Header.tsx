import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";

type HeaderProps = {
  transparent?: boolean;
};

export function Header({ transparent = false }: HeaderProps) {
  return (
    <header
      className={`sticky top-0 z-50 border-b border-sand/70 backdrop-blur-md ${
        transparent ? "bg-cream/80" : "bg-ivory/90"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-deep font-display text-lg text-ivory">
            M
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg text-olive">
              Madeye Enterprises
            </span>
            <span className="block text-[11px] uppercase tracking-[0.22em] text-olive-muted">
              Home décor atelier
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-olive-muted md:flex">
          <Link href="/#shop" className="hover:text-olive">
            Shop
          </Link>
          <Link href="/about" className="hover:text-olive">
            About
          </Link>
          <Link href="/#support" className="hover:text-olive">
            Support
          </Link>
        </nav>

        <AuthNav />
      </div>
    </header>
  );
}
