import type { Task } from "../lib/useTasks";

const priorityColor: Record<string, string> = {
  high: "bg-accent",
  medium: "bg-amber-400",
  low: "bg-zinc-500",
};

const priorityLabel: Record<string, string> = {
  high: "Важно",
  medium: "Средне",
  low: "Не срочно",
};

function formatEstimate(min: number | null | undefined): string | null {
  if (!min || min <= 0) return null;
  if (min < 60) return `${min} мин`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}

function formatDue(date: string | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

// Строка с приоритетом, оценкой времени и дедлайном под названием задачи.
export default function TaskMeta({ task }: { task: Task }) {
  const estimate = formatEstimate(task.estimateMin);
  const due = formatDue(task.dueDate);
  const dot = priorityColor[task.priority ?? "low"] ?? "bg-zinc-500";
  const label = priorityLabel[task.priority ?? "low"] ?? "Не срочно";

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
      <span className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </span>
      {estimate && <span>⏱ {estimate}</span>}
      {due && <span>📅 {due}</span>}
    </div>
  );
}
