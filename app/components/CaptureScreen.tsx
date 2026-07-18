"use client";

import { useState } from "react";
import { useSpeech } from "../lib/useSpeech";

function IconMic() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4M8 22h8" />
    </svg>
  );
}

function IconStop() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
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

  // Голосовой ввод: распознанный кусок дописываем в поле
  const speech = useSpeech((chunk) => {
    if (!chunk) return;
    setText((prev) => (prev ? `${prev} ${chunk}` : chunk));
  });

  const canSend = text.trim().length > 0 && !loading;

  async function handleSend() {
    if (!canSend) return;
    if (speech.listening) speech.stop();
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

  function toggleMic() {
    if (speech.listening) speech.stop();
    else speech.start();
  }

  // Показываем распознаваемую речь вживую, дописывая к уже набранному тексту
  const displayValue =
    speech.listening && speech.interim
      ? `${text ? text + " " : ""}${speech.interim}`
      : text;

  return (
    <section className="flex flex-1 flex-col px-5 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Что в голове?</h1>
      <p className="mt-1 text-sm text-muted">
        Скажи или напиши — AI разберёт на задачи
      </p>

      <textarea
        value={displayValue}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        className="mt-5 w-full flex-1 resize-none bg-transparent text-lg leading-relaxed placeholder:text-muted focus:outline-none disabled:opacity-60"
        placeholder={"Например: позвонить маме, купить билеты на поезд, доделать отчёт до пятницы, записаться к врачу"}
      />

      {(error || speech.error) && (
        <p className="mb-2 rounded-xl bg-accent/15 px-4 py-2 text-sm text-accent">
          {error || speech.error}
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
          {speech.supported ? (
            <>
              <button
                type="button"
                onClick={toggleMic}
                disabled={loading}
                aria-label={speech.listening ? "Остановить запись" : "Диктовать голосом"}
                className={`flex h-16 w-16 items-center justify-center rounded-full transition-all active:scale-95 ${
                  speech.listening
                    ? "animate-pulse bg-accent text-white shadow-lg"
                    : "border border-border text-foreground"
                }`}
              >
                {speech.listening ? <IconStop /> : <IconMic />}
              </button>
              <span className="text-xs text-muted">
                {speech.listening ? "Слушаю… нажми, чтобы остановить" : "Нажми и говори"}
              </span>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled
                aria-label="Голос недоступен"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted opacity-50"
              >
                <IconMic />
              </button>
              <span className="text-xs text-muted">
                Голос не поддерживается в этом браузере
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
