"use client";

import type { Task } from "../lib/useTasks";

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

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? "Снять отметку" : "Отметить выполненной"}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.done
            ? "border-accent bg-accent text-white"
            : "border-border text-transparent"
        }`}
      >
        <IconCheck />
      </button>

      <span
        className={`flex-1 text-[15px] ${
          task.done ? "text-muted line-through" : ""
        }`}
      >
        {task.title}
      </span>

      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label="Удалить задачу"
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
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <section className="flex flex-1 flex-col px-5 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Входящие</h1>
      <p className="mt-1 text-sm text-muted">
        {tasks.length === 0
          ? "Сюда попадут задачи из твоих мыслей"
          : `Задач: ${tasks.length} · выполнено: ${doneCount}`}
      </p>

      {tasks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted">
          <IconInboxLarge />
          <p className="max-w-xs text-sm">
            Пока пусто. Напиши что-нибудь на экране «Захват».
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
            />
          ))}
        </ul>
      )}
    </section>
  );
}
