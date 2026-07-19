"use client";

import { useEffect, useState } from "react";
import type { Task, TaskFields } from "../lib/useTasks";

const PRIORITIES: { value: TaskFields["priority"]; label: string }[] = [
  { value: "high", label: "🔴 Важливо" },
  { value: "medium", label: "🟡 Середнє" },
  { value: "low", label: "⚪ Не терм." },
];

export default function TaskEditorSheet({
  open,
  task, // null = створення нової
  onClose,
  onSave,
}: {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (fields: TaskFields) => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskFields["priority"]>("medium");
  const [estimate, setEstimate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [today, setToday] = useState(false);

  // Заполняем поля при каждом открытии
  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setPriority(task?.priority ?? "medium");
    setEstimate(task?.estimateMin ? String(task.estimateMin) : "");
    setDueDate(task?.dueDate ?? "");
    setToday(task?.today ?? false);
  }, [open, task]);

  if (!open) return null;

  const canSave = title.trim().length > 0;

  function save() {
    if (!canSave) return;
    const est = parseInt(estimate, 10);
    onSave({
      title: title.trim(),
      priority,
      estimateMin: Number.isFinite(est) && est > 0 ? est : null,
      dueDate: dueDate || null,
      today,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Закрити"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />

      <div className="animate-fade-in relative z-10 w-full max-w-md rounded-t-3xl border border-white/[0.06] bg-surface px-6 pb-8 pt-3">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />

        <h2 className="text-lg font-semibold">
          {task ? "Редагувати задачу" : "Нова задача"}
        </h2>

        <label className="mb-1.5 mt-4 block text-xs text-muted">Назва</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Що треба зробити?"
          autoFocus={!task}
          className="h-12 w-full rounded-xl border border-white/[0.05] bg-surface-2 px-4 text-base placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />

        <label className="mb-1.5 mt-4 block text-xs text-muted">Пріоритет</label>
        <div className="grid grid-cols-3 gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className={`h-11 rounded-xl text-sm font-medium transition-colors ${
                priority === p.value
                  ? "bg-accent/20 text-foreground ring-1 ring-accent/50"
                  : "border border-white/[0.05] bg-surface-2 text-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-muted">Час, хв</label>
            <input
              value={estimate}
              onChange={(e) => setEstimate(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="30"
              className="h-12 w-full rounded-xl border border-white/[0.05] bg-surface-2 px-4 text-base placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Дедлайн</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-12 w-full rounded-xl border border-white/[0.05] bg-surface-2 px-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 [color-scheme:dark]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setToday(!today)}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/[0.05] bg-surface-2 px-4 py-3.5"
        >
          <span className="text-sm">☀️ У план на сьогодні</span>
          <span
            className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
              today ? "bg-accent" : "bg-white/10"
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full bg-white transition-transform ${
                today ? "translate-x-5" : ""
              }`}
            />
          </span>
        </button>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-13 flex-1 rounded-2xl border border-white/[0.06] py-3.5 text-sm font-medium text-muted active:bg-surface-2"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className={`flex-1 rounded-2xl py-3.5 text-sm font-semibold transition-all ${
              canSave
                ? "bg-accent text-white shadow-lg shadow-accent/25 active:scale-[0.98]"
                : "bg-surface-2 text-muted"
            }`}
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
}
