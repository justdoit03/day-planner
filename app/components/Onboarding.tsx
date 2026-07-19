"use client";

import { useState } from "react";

export default function Onboarding({
  initialName,
  onDone,
}: {
  initialName: string;
  onDone: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <div className="mb-4 text-5xl">👋</div>
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight">
          В голові — каша?
        </h1>
        <p className="mt-1.5 text-[17px] font-medium text-foreground/90">
          Це нормально. Просто скажи її вголос.
        </p>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-muted">
          AI розкладе все по поличках: що важливо, що почекає, з чого почати.
          А «Фокус» поведе за руку — від першої справи до останньої.{" "}
          <span className="text-foreground">До конфеті.</span> 🎉
        </p>
      </div>

      <label className="mb-2 text-xs text-muted">Як до тебе звертатися?</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ім'я"
        className="h-14 w-full rounded-2xl border border-white/[0.05] bg-surface px-5 text-base placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
      />

      <button
        type="button"
        onClick={() => onDone(name.trim())}
        className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-base font-semibold text-white shadow-lg shadow-accent/25 transition-transform active:scale-[0.98]"
      >
        Поїхали 🚀
      </button>
    </div>
  );
}
