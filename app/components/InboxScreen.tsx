"use client";

import { useRef, useState } from "react";
import type { Task } from "../lib/useTasks";
import TaskMeta from "./TaskMeta";
import { isOverdue } from "../lib/dates";

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

const SWIPE_THRESHOLD = 72;

// Обёртка со свайпом: тянешь вправо — виконати, влево — видалити.
// Тап по-прежнему работает (свайп срабатывает только при горизонтальном жесте).
function SwipeRow({
  onSwipeRight,
  onSwipeLeft,
  children,
}: {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  children: React.ReactNode;
}) {
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const engaged = useRef(false);
  const suppressClick = useRef(false);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
    engaged.current = false;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!start.current) return;
    const t = e.touches[0];
    const dX = t.clientX - start.current.x;
    const dY = t.clientY - start.current.y;
    if (!engaged.current) {
      // вертикальный жест — это скролл, не мешаем
      if (Math.abs(dY) > 10 && Math.abs(dY) > Math.abs(dX)) {
        start.current = null;
        return;
      }
      if (Math.abs(dX) > 12) {
        engaged.current = true;
        setDragging(true);
      } else return;
    }
    setDx(Math.max(-120, Math.min(120, dX)));
  }

  function onTouchEnd() {
    if (engaged.current) {
      // гасим «призрачный» клик после свайпа
      suppressClick.current = true;
      setTimeout(() => (suppressClick.current = false), 350);
    }
    if (dx > SWIPE_THRESHOLD) onSwipeRight();
    else if (dx < -SWIPE_THRESHOLD) onSwipeLeft();
    setDragging(false);
    setDx(0);
    start.current = null;
    engaged.current = false;
  }

  const rightHint = Math.min(1, Math.max(0, dx / SWIPE_THRESHOLD)); // вправо → виконати
  const leftHint = Math.min(1, Math.max(0, -dx / SWIPE_THRESHOLD)); // влево → видалити

  return (
    <li className="relative overflow-hidden rounded-2xl">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-5">
        <span
          className="flex items-center gap-1.5 text-sm font-semibold text-accent"
          style={{ opacity: rightHint }}
        >
          <IconCheck /> Виконати
        </span>
        <span
          className="text-sm font-semibold text-danger"
          style={{ opacity: leftHint }}
        >
          Видалити
        </span>
      </div>
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
        className="relative"
      >
        {children}
      </div>
    </li>
  );
}

function TaskRow({
  task,
  onToggle,
  onDelete,
  onToggleToday,
  onEdit,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleToday: (id: string) => void;
  onEdit: (task: Task) => void;
}) {
  return (
    <SwipeRow
      onSwipeRight={() => onToggle(task.id)}
      onSwipeLeft={() => onDelete(task.id)}
    >
      <div className="flex items-start gap-3 rounded-2xl border border-white/[0.05] bg-surface px-4 py-3.5">
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

        <button
          type="button"
          onClick={() => onEdit(task)}
          className="min-w-0 flex-1 text-left"
        >
          <span
            className={`block text-[15px] ${
              task.done ? "text-muted line-through" : ""
            }`}
          >
            {task.title}
          </span>
          {!task.done && <TaskMeta task={task} />}
        </button>

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
      </div>
    </SwipeRow>
  );
}

// Порядок: невыполненные сверху — сначала прострочені, потім за датою, потім
// за пріоритетом; виконані — вниз.
const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };

function groupOf(t: Task): number {
  if (isOverdue(t.dueDate)) return 0; // прострочено — наверх
  if (t.dueDate) return 1; // с датой (сегодня/будущее)
  return 2; // без даты
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    const ga = groupOf(a);
    const gb = groupOf(b);
    if (ga !== gb) return ga - gb;
    if (ga <= 1) {
      const da = a.dueDate ?? "";
      const db = b.dueDate ?? "";
      if (da !== db) return da.localeCompare(db);
    }
    const ra = priorityRank[a.priority ?? "low"] ?? 3;
    const rb = priorityRank[b.priority ?? "low"] ?? 3;
    if (ra !== rb) return ra - rb;
    return b.createdAt - a.createdAt;
  });
}

export default function InboxScreen({
  tasks,
  onToggle,
  onDelete,
  onToggleToday,
  onEdit,
  onAdd,
  onClearDone,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleToday: (id: string) => void;
  onEdit: (task: Task) => void;
  onAdd: () => void;
  onClearDone: () => void;
}) {
  const doneCount = tasks.filter((t) => t.done).length;
  const [confirmClear, setConfirmClear] = useState(false);
  const ordered = sortTasks(tasks);

  return (
    <section className="flex flex-1 flex-col px-5 pt-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Вхідні</h1>
          <p className="mt-1 text-sm text-muted">
            {tasks.length === 0
              ? "Сюди потраплять задачі з твоїх думок"
              : `Задач: ${tasks.length} · виконано: ${doneCount}`}
          </p>
        </div>
        {doneCount > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirmClear) {
                onClearDone();
                setConfirmClear(false);
              } else {
                setConfirmClear(true);
                setTimeout(() => setConfirmClear(false), 3000);
              }
            }}
            className={`mt-1 shrink-0 rounded-full px-3.5 py-2 text-xs font-medium transition-colors ${
              confirmClear
                ? "bg-danger/20 text-danger"
                : "border border-white/[0.07] text-muted active:bg-surface"
            }`}
          >
            {confirmClear ? `Видалити ${doneCount}?` : "🧹 Очистити виконані"}
          </button>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted">
          <IconInboxLarge />
          <p className="max-w-xs text-sm">
            Поки порожньо. Скажи або напиши щось на екрані «Думки».
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-2 rounded-full border border-white/[0.07] bg-surface px-4 py-2 text-sm text-muted transition-colors active:bg-surface-2 active:text-foreground"
          >
            ➕ Додати задачу вручну
          </button>
        </div>
      ) : (
        <>
          <p className="mt-3 text-center text-[11px] text-muted/50">
            Свайп вправо — виконати, вліво — видалити
          </p>
          <ul className="mt-3 flex flex-col gap-2 pb-2">
            {ordered.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onToggleToday={onToggleToday}
                onEdit={onEdit}
              />
            ))}
          </ul>
        </>
      )}

      {tasks.length > 0 && (
        <button
          type="button"
          onClick={onAdd}
          className="mb-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.12] text-sm text-muted transition-colors active:bg-surface active:text-foreground"
        >
          ➕ Додати задачу
        </button>
      )}
    </section>
  );
}
