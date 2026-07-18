"use client";

import { useState } from "react";

function IconMic() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" />
    </svg>
  );
}

export default function CaptureScreen({
  onCapture,
}: {
  // возвращает текст ошибки или null при успехе
  onCapture: (text: string) => Promise<string | null>;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSend = text.trim().length > 0 && !loading;

  async function handleSend() {
    if (!canSend) return;
    setLoading(true);
    setError(null);
    const err = await onCapture(text);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setText(""); // успех — очищаем поле
    }
  }

  return (
    <section className="flex flex-1 flex-col px-5 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Что в голове?</h1>
      <p className="mt-1 text-sm text-muted">
        Вывали всё подряд — AI разберёт на задачи
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        className="mt-5 w-full flex-1 resize-none bg-transparent text-lg leading-relaxed placeholder:text-muted focus:outline-none disabled:opacity-60"
        placeholder={"Например: позвонить маме, купить билеты на поезд, доделать отчёт до пятницы, записаться к врачу"}
      />

      {error && (
        <p className="mb-2 rounded-xl bg-accent/15 px-4 py-2 text-sm text-accent">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4 py-6">
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-all ${
            canSend || loading
              ? "bg-accent text-white active:scale-[0.98]"
              : "bg-surface-2 text-muted"
          }`}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Разбираю…
            </>
          ) : (
            "Разобрать в задачи"
          )}
        </button>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            aria-label="Диктовать голосом"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted"
          >
            <IconMic />
          </button>
          <span className="text-xs text-muted">Голос — скоро</span>
        </div>
      </div>
    </section>
  );
}
