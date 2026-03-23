import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="nav-pad sticky top-0 z-[100] flex justify-between items-center bg-[rgba(14,13,12,0.92)] backdrop-blur-[14px] border-b border-white/[0.06]">
      {/* Logo */}
      <Link
        href="/"
        className="no-underline"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 22,
          fontWeight: 300,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--charcoal)',
        }}
      >
        K<span style={{ color: 'var(--rose)' }}>PEACH</span>GIRL
      </Link>

      {/* Desktop nav */}
      <div className="font-sans nav-links gap-7 items-center">
        <Link
          href="/"
          className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase no-underline hover:text-charcoal transition-colors"
        >
          Browse
        </Link>
        <Link
          href="/admin"
          className="py-[7px] px-5 bg-charcoal text-cream border-none text-[10px] font-bold tracking-[0.14em] uppercase no-underline font-sans"
        >
          Admin
        </Link>
      </div>

      {/* Mobile admin button */}
      <Link
        href="/admin"
        className="mob-admin hidden py-1.5 px-3.5 bg-charcoal text-cream border-none text-[9px] font-bold tracking-[0.12em] uppercase no-underline font-sans"
      >
        Admin
      </Link>
    </nav>
  );
}
