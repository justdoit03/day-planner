"use client";

import type { Task } from "../lib/useTasks";
import TaskMeta from "./TaskMeta";
import { todayISO, isoInDays, isOverdue } from "../lib/dates";

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconWeekLarge() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

// Красивая подпись дня: Сьогодні / Завтра / «пн, 22 лип.»
function dayLabel(offset: number, iso: string): string {
  if (offset === 0) return "Сьогодні";
  if (offset === 1) return "Завтра";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("uk-UA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function TaskRow({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (id: string) => void;
}) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-white/[0.05] bg-surface px-4 py-3">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? "Зняти позначку" : "Позначити виконаною"}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          task.done
            ? "border-accent bg-accent text-white"
            : "border-border text-transparent"
        }`}
      >
        <IconCheck />
      </button>
      <div className="min-w-0 flex-1">
        <span
          className={`block text-[15px] ${task.done ? "text-muted line-through" : ""}`}
        >
          {task.title}
        </span>
        {!task.done && <TaskMeta task={task} />}
      </div>
    </li>
  );
}

export default function WeekScreen({
  tasks,
  onToggle,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
}) {
  const today = todayISO();

  // Просроченные (дедлайн раньше сегодня и не выполнено)
  const overdue = tasks
    .filter((t) => !t.done && isOverdue(t.dueDate))
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));

  // Следующие 7 дней
  const days = Array.from({ length: 7 }, (_, i) => {
    const iso = i === 0 ? today : isoInDays(i);
    const items = tasks
      .filter((t) => !t.done && t.dueDate === iso)
      .sort((a, b) => {
        const rank = { high: 0, medium: 1, low: 2 } as const;
        return (
          (rank[a.priority ?? "low"] ?? 3) - (rank[b.priority ?? "low"] ?? 3)
        );
      });
    return { offset: i, iso, items };
  });

  const scheduledCount =
    overdue.length + days.reduce((s, d) => s + d.items.length, 0);

  return (
    <section className="flex flex-1 flex-col px-5 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Тиждень</h1>
      <p className="mt-1 text-sm text-muted">
        {scheduledCount === 0
          ? "Найближчі 7 днів — задачі з дедлайнами зʼявляться тут"
          : "Задачі з дедлайнами на найближчі 7 днів"}
      </p>

      {scheduledCount === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted">
          <IconWeekLarge />
          <p className="max-w-xs text-sm">
            Поки немає задач із датами. Постав дедлайн задачі у «Вхідних» — і
            вона зʼявиться у плані на тиждень.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-6 pb-6">
          {/* Прострочено */}
          {overdue.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-danger">
                <span>⚠️</span>
                Прострочено
                <span className="text-danger/60">· {overdue.length}</span>
              </div>
              <ul className="flex flex-col gap-2">
                {overdue.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={onToggle} />
                ))}
              </ul>
            </div>
          )}

          {/* 7 дней */}
          {days.map((d) => (
            <div key={d.iso}>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                <span
                  className={d.offset === 0 ? "text-accent" : "text-muted"}
                >
                  {dayLabel(d.offset, d.iso)}
                </span>
                {d.items.length > 0 && (
                  <span className="text-muted/60">· {d.items.length}</span>
                )}
              </div>
              {d.items.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-white/[0.06] px-4 py-3 text-xs text-muted/50">
                  Вільно
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {d.items.map((task) => (
                    <TaskRow key={task.id} task={task} onToggle={onToggle} />
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
