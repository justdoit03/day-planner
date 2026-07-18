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
  onCapture: (text: string) => void;
}) {
  const [text, setText] = useState("");
  const canSend = text.trim().length > 0;

  function handleSend() {
    if (!canSend) return;
    onCapture(text);
    setText("");
  }

  return (
    <section className="flex flex-1 flex-col px-5 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Что в голове?</h1>
      <p className="mt-1 text-sm text-muted">
        Пиши всё подряд — каждая строка станет задачей
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-5 w-full flex-1 resize-none bg-transparent text-lg leading-relaxed placeholder:text-muted focus:outline-none"
        placeholder={"Например:\nпозвонить маме\nкупить билеты\nдоделать отчёт до пятницы"}
      />

      <div className="flex flex-col gap-4 py-6">
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={`h-14 w-full rounded-2xl text-base font-semibold transition-all ${
            canSend
              ? "bg-accent text-white active:scale-[0.98]"
              : "bg-surface-2 text-muted"
          }`}
        >
          Разобрать в задачи
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
