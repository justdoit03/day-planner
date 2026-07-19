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
        <div className="mb-3 text-5xl">👋</div>
        <h1 className="text-3xl font-semibold tracking-tight">Привет!</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted">
          Вываливай всё из головы — голосом или текстом.{" "}
          <span className="text-foreground">AI</span> соберёт из хаоса задачи и{" "}
          <span className="text-foreground">план на сегодня</span>, а «Фокус»
          проведёт тебя по нему.
        </p>
      </div>

      <label className="mb-2 text-xs text-muted">Как к тебе обращаться?</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Имя"
        className="h-14 w-full rounded-2xl border border-white/[0.05] bg-surface px-5 text-base placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
      />

      <button
        type="button"
        onClick={() => onDone(name.trim())}
        className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-base font-semibold text-white shadow-lg shadow-accent/25 transition-transform active:scale-[0.98]"
      >
        Поехали 🚀
      </button>
    </div>
  );
}
