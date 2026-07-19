"use client";

import type { Task } from "../lib/useTasks";
import TaskMeta from "./TaskMeta";

function IconInboxLarge() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" />
    </svg>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
  onToggleToday,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleToday: (id: string) => void;
}) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-white/[0.05] bg-surface px-4 py-3.5">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? "Зняти позначку" : "Позначити виконаною"}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.done
            ? "border-accent bg-accent text-white"
            : "border-border text-transparent"
        }`}
      >
        <IconCheck />
      </button>

      <div className="min-w-0 flex-1">
        <span
          className={`block text-[15px] ${
            task.done ? "text-muted line-through" : ""
          }`}
        >
          {task.title}
        </span>
        {!task.done && <TaskMeta task={task} />}
      </div>

      {!task.done && (
        <button
          type="button"
          onClick={() => onToggleToday(task.id)}
          aria-label={task.today ? "Прибрати з сьогодні" : "У план на сьогодні"}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
            task.today
              ? "bg-amber-400/20 text-amber-400"
              : "text-muted active:bg-surface-2"
          }`}
        >
          <IconSun />
        </button>
      )}

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label="Видалити задачу"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted active:bg-surface-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
}

export default function InboxScreen({
  tasks,
  onToggle,
  onDelete,
  onToggleToday,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleToday: (id: string) => void;
}) {
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <section className="flex flex-1 flex-col px-5 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Вхідні</h1>
      <p className="mt-1 text-sm text-muted">
        {tasks.length === 0
          ? "Сюди потраплять задачі з твоїх думок"
          : `Задач: ${tasks.length} · виконано: ${doneCount}`}
      </p>

      {tasks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted">
          <IconInboxLarge />
          <p className="max-w-xs text-sm">
            Поки порожньо. Скажи або напиши щось на екрані «Думки».
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2 pb-6">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onToggleToday={onToggleToday}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
