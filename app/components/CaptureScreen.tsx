"use client";

import { useEffect, useState } from "react";
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

const EXAMPLE_DUMP =
  "сьогодні терміново дописати звіт для клієнта до вечора, подзвонити мамі привітати з днем народження, " +
  "купити продукти на тиждень, записатися до стоматолога на наступний тиждень, " +
  "оплатити комуналку до 25-го, і колись нарешті розібрати фотографії з відпустки";

// Скелетон-карточки: AI «матеріалізує» задачі
function AiSkeleton() {
  return (
    <div className="mt-5 flex flex-1 flex-col">
      <p className="mb-4 flex items-center gap-2 text-sm text-muted">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-border border-t-accent" />
        AI розбирає думки на задачі…
      </p>
      <div className="flex flex-col gap-2.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-white/[0.05] bg-surface px-4 py-4"
            style={{ animationDelay: `${i * 0.18}s` }}
          >
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-surface-2" />
              <div className="flex-1">
                <div
                  className="h-3.5 rounded bg-surface-2"
                  style={{ width: `${75 - i * 12}%` }}
                />
                <div className="mt-2 flex gap-2">
                  <div className="h-2.5 w-14 rounded bg-surface-2" />
                  <div className="h-2.5 w-10 rounded bg-surface-2" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "Доброї ночі";
  if (h < 12) return "Доброго ранку";
  if (h < 18) return "Доброго дня";
  return "Доброго вечора";
}

export default function CaptureScreen({
  onCapture,
  name,
}: {
  // возвращает текст ошибки или null при успехе
  onCapture: (text: string) => Promise<string | null>;
  name?: string;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // iPhone? (нужно, чтобы подсказать открыть в Safari, если голос недоступен)
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));
  }, []);

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
      {name ? (
        <p className="mb-1 text-sm text-muted">
          {greeting()}, <span className="text-foreground">{name}</span> 👋
        </p>
      ) : null}
      <h1 className="text-2xl font-semibold tracking-tight">Що в голові?</h1>
      <p className="mt-1 text-sm text-muted">
        Скажи або напиши — AI розбере на задачі та збере план на сьогодні
      </p>

      {loading ? (
        <AiSkeleton />
      ) : (
        <>
          <textarea
            value={displayValue}
            onChange={(e) => setText(e.target.value)}
            className="mt-5 w-full flex-1 resize-none bg-transparent text-lg leading-relaxed placeholder:text-muted focus:outline-none"
            placeholder={"Наприклад: подзвонити мамі, купити квитки на потяг, дописати звіт до п'ятниці, записатися до лікаря"}
          />
          {!text.trim() && !speech.listening && (
            <button
              type="button"
              onClick={() => setText(EXAMPLE_DUMP)}
              className="mb-3 self-start rounded-full border border-white/[0.07] bg-surface px-4 py-2 text-sm text-muted transition-colors active:bg-surface-2 active:text-foreground"
            >
              ✨ Спробувати з прикладом
            </button>
          )}
        </>
      )}

      {(error || speech.error) && (
        <p className="mb-2 rounded-xl bg-danger/15 px-4 py-2 text-sm text-danger">
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
              ? "bg-accent text-white shadow-lg shadow-accent/25 active:scale-[0.98]"
              : "bg-surface-2 text-muted"
          }`}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Розбираю…
            </>
          ) : (
            "Розібрати в задачі"
          )}
        </button>

        <div className="flex flex-col items-center gap-1">
          {speech.supported ? (
            <>
              <button
                type="button"
                onClick={toggleMic}
                disabled={loading}
                aria-label={speech.listening ? "Зупинити запис" : "Диктувати голосом"}
                className={`flex h-16 w-16 items-center justify-center rounded-full transition-all active:scale-95 ${
                  speech.listening
                    ? "animate-pulse bg-accent text-white shadow-lg"
                    : "border border-border text-foreground"
                }`}
              >
                {speech.listening ? <IconStop /> : <IconMic />}
              </button>
              <span className="text-xs text-muted">
                {speech.listening ? "Слухаю… натисни, щоб зупинити" : "Натисни і говори"}
              </span>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled
                aria-label="Голос недоступний"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted opacity-50"
              >
                <IconMic />
              </button>
              <span className="max-w-[16rem] text-center text-xs text-muted">
                {isIOS
                  ? "Голос працює в Safari. Відкрий посилання в Safari (у Telegram: «···» → «Відкрити в Safari»)."
                  : "Голос не підтримується в цьому браузері — можна писати текстом."}
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
