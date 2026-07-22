import type { Task } from "../lib/useTasks";
import { isOverdue, isDueToday } from "../lib/dates";

const priorityColor: Record<string, string> = {
  high: "bg-danger",
  medium: "bg-amber-500",
  low: "bg-zinc-400",
};

const priorityLabel: Record<string, string> = {
  high: "Важливо",
  medium: "Середнє",
  low: "Не терміново",
};

function formatEstimate(min: number | null | undefined): string | null {
  if (!min || min <= 0) return null;
  if (min < 60) return `${min} хв`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} год ${m} хв` : `${h} год`;
}

function formatDue(date: string | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}

// Строка с приоритетом, оценкой времени и дедлайном под названием задачи.
// hideTime — скрыть время «🕒 HH:MM» (напр. в ленте дня, где время слева).
export default function TaskMeta({
  task,
  hideTime = false,
}: {
  task: Task;
  hideTime?: boolean;
}) {
  const estimate = formatEstimate(task.estimateMin);
  const due = formatDue(task.dueDate);
  const dot = priorityColor[task.priority ?? "low"] ?? "bg-zinc-500";
  const label = priorityLabel[task.priority ?? "low"] ?? "Не терміново";
  const overdue = isOverdue(task.dueDate);
  const dueToday = isDueToday(task.dueDate);

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
      <span className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </span>
      {!hideTime && task.dueTime && (
        <span className="font-medium text-foreground/80">🕒 {task.dueTime}</span>
      )}
      {estimate && <span>⏱ {estimate}</span>}
      {due && (
        <span
          className={
            overdue
              ? "font-medium text-danger"
              : dueToday
                ? "font-medium text-amber-600"
                : ""
          }
        >
          {overdue ? "⚠️" : "📅"} {overdue ? `${due} · прострочено` : due}
        </span>
      )}
    </div>
  );
}
