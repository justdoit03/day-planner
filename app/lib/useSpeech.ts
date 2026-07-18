"use client";

import { useEffect, useRef, useState } from "react";

// Распознавание речи через встроенный в браузер Web Speech API.
// Бесплатно, без ключей. Работает в Chrome и Safari (в т.ч. на телефоне).
export function useSpeech(onFinal: (chunk: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null);
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any =
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown })
        .webkitSpeechRecognition;

    if (!SR) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const rec = new SR();
    rec.lang = "ru-RU";
    rec.continuous = true;
    rec.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) {
          onFinalRef.current(res[0].transcript.trim());
        } else {
          interimText += res[0].transcript;
        }
      }
      setInterim(interimText);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (e: any) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setError("Нет доступа к микрофону. Разреши его в браузере.");
      } else if (e.error !== "no-speech" && e.error !== "aborted") {
        setError("Не получилось распознать. Попробуй ещё раз.");
      }
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
      setInterim("");
    };

    recRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    };
  }, []);

  function start() {
    if (!recRef.current) return;
    setError(null);
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      // start() бросает, если уже запущено — игнорируем
    }
  }

  function stop() {
    if (!recRef.current) return;
    try {
      recRef.current.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }

  return { supported, listening, interim, error, start, stop };
}
