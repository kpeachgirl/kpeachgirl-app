export default function Footer() {
  return (
    <footer className="footer-pad border-t border-sand flex flex-col sm:flex-row justify-between items-center gap-3">
      <span className="font-serif text-xl font-normal text-muted">
        K<span className="text-rose">peach</span>girl
      </span>
      <a
        href="mailto:kpeachgirl@hotmail.com"
        className="font-sans text-[13px] font-medium tracking-[0.06em] text-muted no-underline hover:text-rose transition-colors"
      >
        kpeachgirl@hotmail.com
      </a>
      <span className="font-sans text-[12px] font-semibold tracking-[0.12em] text-charcoal uppercase">
        &copy; 2026 &middot; All models are 18+
      </span>
    </footer>
  );
}
