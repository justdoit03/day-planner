"use client";

import type { Task } from "../lib/useTasks";
import TaskMeta from "./TaskMeta";

function IconTodayLarge() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="m9 16 2 2 4-4" />
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

function TaskRow({
  task,
  onToggle,
  onToggleToday,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onToggleToday: (id: string) => void;
}) {
  return (
    <li className="flex items-start gap-3 rounded-2xl bg-surface px-4 py-3.5">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? "Снять отметку" : "Отметить выполненной"}
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

      <button
        type="button"
        onClick={() => onToggleToday(task.id)}
        aria-label="Убрать из плана на сегодня"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted active:bg-surface-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
}

export default function TodayScreen({
  tasks,
  onToggle,
  onToggleToday,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onToggleToday: (id: string) => void;
}) {
  const today = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const doneCount = tasks.filter((t) => t.done).length;
  // Невыполненные сверху, выполненные — вниз
  const sorted = [...tasks].sort((a, b) => Number(a.done) - Number(b.done));

  return (
    <section className="flex flex-1 flex-col px-5 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Сегодня</h1>
      <p className="mt-1 text-sm capitalize text-muted">
        {today}
        {tasks.length > 0 && (
          <span className="lowercase">
            {" "}
            · {doneCount} из {tasks.length}
          </span>
        )}
      </p>

      {tasks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted">
          <IconTodayLarge />
          <p className="max-w-xs text-sm">
            План пуст. Во «Входящих» нажми ☀️ на задачах, которые сделаешь сегодня.
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-2 pb-6">
          {sorted.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={onToggle}
              onToggleToday={onToggleToday}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
