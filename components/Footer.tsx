export default function Footer() {
  return (
    <footer className="footer-pad border-t border-sand flex flex-col sm:flex-row justify-between items-center gap-3">
      <span className="font-serif text-lg font-normal text-muted">
        K<span className="text-rose">peach</span>girl
      </span>
      <a
        href="mailto:kpeachgirl@hotmail.com"
        className="font-sans text-[11px] font-medium tracking-[0.06em] text-muted no-underline hover:text-rose transition-colors"
      >
        kpeachgirl@hotmail.com
      </a>
      <span className="font-sans text-[10px] font-semibold tracking-[0.12em] text-sand uppercase">
        &copy; 2026 &middot; All models are 18+
      </span>
    </footer>
  );
}
