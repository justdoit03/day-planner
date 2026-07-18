"use client";

function IconMic() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" />
    </svg>
  );
}

export default function CaptureScreen() {
  return (
    <section className="flex flex-1 flex-col px-5 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Что в голове?</h1>
      <p className="mt-1 text-sm text-muted">
        Вывали всё подряд — разберём потом
      </p>

      <textarea
        className="mt-5 w-full flex-1 resize-none bg-transparent text-lg leading-relaxed placeholder:text-muted focus:outline-none"
        placeholder="Например: позвонить маме, купить билеты, доделать отчёт до пятницы…"
      />

      <div className="flex flex-col items-center gap-2 py-6">
        <button
          type="button"
          aria-label="Диктовать голосом"
          className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform active:scale-95"
        >
          <IconMic />
        </button>
        <span className="text-xs text-muted">Голос — скоро</span>
      </div>
    </section>
  );
}
