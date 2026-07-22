"use client";

import { useState } from "react";
import type { Task } from "../lib/useTasks";

export default function ProfileSheet({
  open,
  onClose,
  avatarUrl,
  name,
  email,
  tasks,
  onSaveName,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  avatarUrl: string | null;
  name: string;
  email: string;
  tasks: Task[];
  onSaveName: (name: string) => void;
  onSignOut: () => void;
}) {
  const [draft, setDraft] = useState(name);
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const todayCount = tasks.filter((t) => t.today && !t.done).length;

  const dirty = draft.trim() !== name && draft.trim().length > 0;

  function save() {
    if (!dirty) return;
    onSaveName(draft.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* затемнення */}
      <button
        type="button"
        aria-label="Закрити"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />

      {/* шит */}
      <div className="animate-fade-in relative z-10 w-full max-w-md rounded-t-3xl border border-border bg-surface px-6 pb-8 pt-3">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" />

        {/* хто я */}
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-14 w-14 rounded-full border border-border"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xl font-semibold text-white">
              {(name || email || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold">{name || "Без імені"}</div>
            <div className="truncate text-sm text-muted">{email}</div>
          </div>
        </div>

        {/* прогрес */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { n: total, label: "задач" },
            { n: done, label: "виконано" },
            { n: todayCount, label: "на сьогодні" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-surface-2 px-3 py-3 text-center"
            >
              <div className="text-xl font-semibold">{s.n}</div>
              <div className="mt-0.5 text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* звертання */}
        <label className="mb-2 mt-6 block text-xs text-muted">
          Як до тебе звертатися?
        </label>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ім'я"
            className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-4 text-base placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className={`h-12 shrink-0 rounded-xl px-4 text-sm font-semibold transition-all ${
              dirty
                ? "bg-foreground text-background active:scale-[0.97]"
                : "bg-surface-2 text-muted"
            }`}
          >
            {saved ? "✓" : "Зберегти"}
          </button>
        </div>

        {/* вихід */}
        <button
          type="button"
          onClick={onSignOut}
          className="mt-6 h-12 w-full rounded-xl border border-border text-sm font-medium text-muted transition-colors active:bg-surface-2 active:text-foreground"
        >
          Вийти з акаунта
        </button>
      </div>
    </div>
  );
}
