export default function ClosedNotice() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center grain px-6">
      <div className="text-center max-w-md">
        <span className="font-serif text-3xl font-normal text-charcoal tracking-wide">
          K<span className="text-rose">peach</span>girl
        </span>
        <div className="mt-10 h-px w-16 bg-sand mx-auto" />
        <p className="mt-10 font-serif text-xl text-ink italic">
          This site is under maintenance right now.
        </p>
        <p className="mt-6 text-sm text-muted tracking-wide">
          We&rsquo;ll be back shortly.
        </p>
      </div>
    </div>
  );
}
