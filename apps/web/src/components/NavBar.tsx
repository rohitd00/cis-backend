import Link from 'next/link';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/compensation', label: 'Explorer' },
  { href: '/compare', label: 'Compare' },
];

export function NavBar() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-tight text-ink">
          Compensation Intelligence
        </Link>
        <nav className="flex gap-6 text-sm text-muted">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
