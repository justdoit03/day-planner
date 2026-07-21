"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import type { Task } from "../lib/useTasks";
import TaskMeta from "./TaskMeta";
import Confetti from "./Confetti";
import { nowHHMM } from "../lib/dates";

const TIERS = ["high", "medium", "low"] as const;
type Tier = (typeof TIERS)[number];

const tierInfo: Record<Tier, { emoji: string; label: string }> = {
  high: { emoji: "🔴", label: "Важливо" },
  medium: { emoji: "🟡", label: "Середнє" },
  low: { emoji: "⚪", label: "Не терміново" },
};

function tierOf(t: Task): Tier {
  return (t.priority ?? "medium") as Tier;
}

const priorityRank: Record<Tier, number> = { high: 0, medium: 1, low: 2 };

// 🐸 «Жаба дня» (Eat the Frog): найважче/найважливіше — зробити першим.
// Серед невиконаних: спершу вищий пріоритет, потім довша задача, потім раніший час.
function pickFrog(undone: Task[]): Task | null {
  if (undone.length < 2) return null;
  return [...undone].sort((a, b) => {
    const r = priorityRank[tierOf(a)] - priorityRank[tierOf(b)];
    if (r !== 0) return r;
    const e = (b.estimateMin ?? 0) - (a.estimateMin ?? 0);
    if (e !== 0) return e;
    return (a.dueTime ?? "99:99").localeCompare(b.dueTime ?? "99:99");
  })[0];
}

function pluralTask(n: number): string {
  const a = n % 10;
  const b = n % 100;
  if (a === 1 && b !== 11) return "задача";
  if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return "задачі";
  return "задач";
}

function formatTotal(min: number): string {
  if (min <= 0) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `~${h} год ${m} хв`;
  if (h) return `~${h} год`;
  return `~${m} хв`;
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 3 14h7l-1 8 11-13h-7l1-7z" />
    </svg>
  );
}

function IconTodayLarge() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}

// Небольшой чекбокс-кружок
function Checkbox({ done }: { done: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        done ? "border-accent bg-accent text-white" : "border-border text-transparent"
      }`}
    >
      <IconCheck />
    </span>
  );
}

export default function TodayScreen({
  tasks,
  onToggle,
  onToggleToday,
  dueSuggestCount,
  onPlanDueToday,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onToggleToday: (id: string) => void;
  dueSuggestCount: number;
  onPlanDueToday: () => void;
}) {
  const [focus, setFocus] = useState(false);

  const today = new Date().toLocaleDateString("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const total = tasks.length;
  const done = tasks.filter((t) => t.done);
  const undone = tasks.filter((t) => !t.done);
  const doneCount = done.length;

  // Текущий тир в фокусе = самый высокий приоритет среди невыполненных
  const currentTier: Tier | null =
    TIERS.find((tier) => undone.some((t) => tierOf(t) === tier)) ?? null;

  // Микро-поздравление при переходе на следующий блок
  const [flash, setFlash] = useState(false);
  const prevTierRef = useRef<Tier | null>(currentTier);
  useEffect(() => {
    if (focus && prevTierRef.current && prevTierRef.current !== currentTier) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1500);
      prevTierRef.current = currentTier;
      return () => clearTimeout(t);
    }
    prevTierRef.current = currentTier;
  }, [currentTier, focus]);

  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  // ---------- РЕЖИМ ФОКУСА ----------
  if (focus) {
    // Всё сделано → поздравление
    if (!currentTier) {
      return (
        <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <Confetti />
          <div className="text-6xl">🎉</div>
          <h1 className="text-2xl font-semibold tracking-tight">
            План на день виконано!
          </h1>
          <p className="max-w-xs text-sm text-muted">
            Ти закрив {total}{" "}
            {total % 10 === 1 && total % 100 !== 11 ? "задачу" : "задач"}. Красунчик 💪
          </p>
          <button
            type="button"
            onClick={() => setFocus(false)}
            className="mt-2 h-12 rounded-2xl bg-accent px-8 text-base font-semibold text-white shadow-lg shadow-accent/25 active:scale-[0.98]"
          >
            Готово
          </button>
        </section>
      );
    }

    const info = tierInfo[currentTier];
    const items = undone.filter((t) => tierOf(t) === currentTier);

    return (
      <section className="flex flex-1 flex-col px-5 pt-5">
        {/* Верх: прогресс + выход */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted">
              Фокус · {doneCount} із {total}
            </span>
            <button
              type="button"
              onClick={() => setFocus(false)}
              className="text-xs text-muted active:text-foreground"
            >
              Вийти
            </button>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {flash && (
          <div className="mb-4 rounded-2xl bg-accent/15 px-4 py-3 text-center text-sm font-medium text-accent">
            Блок закрито! 🎉 Далі →
          </div>
        )}

        <div className="mb-1 text-3xl">{info.emoji}</div>
        <h1 className="text-2xl font-semibold tracking-tight">{info.label}</h1>
        <p className="mt-1 text-sm text-muted">
          Розбери цей блок — залишилось {items.length}
        </p>

        <ul className="mt-5 flex flex-col gap-2.5 pb-6">
          {items.map((task) => (
            <li key={task.id}>
              <button
                type="button"
                onClick={() => onToggle(task.id)}
                className="flex w-full items-start gap-3 rounded-2xl border border-white/[0.05] bg-surface px-4 py-4 text-left transition-transform active:scale-[0.99]"
              >
                <Checkbox done={false} />
                <div className="min-w-0 flex-1">
                  <span className="block text-base">{task.title}</span>
                  <TaskMeta task={task} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // ---------- ОБЫЧНЫЙ ВИД: РОЗУМНИЙ ПЛАН ДНЯ ----------
  // 🐸 Жаба дня (Eat the Frog)
  const frog = pickFrog(undone);
  // ⚖️ 1-3-5 / MIT: чи не перевантажений план
  const big = undone.filter((t) => tierOf(t) === "high").length;
  const mid = undone.filter((t) => tierOf(t) === "medium").length;
  const small = undone.filter((t) => tierOf(t) === "low").length;
  const overloaded = big > 1 || mid > 3 || small > 5 || undone.length > 9;
  // 📋 Лента дня (Time Blocking): зі часом — по годинах, решта — по тирах
  const timed = undone
    .filter((t) => t.dueTime)
    .sort((a, b) => (a.dueTime ?? "").localeCompare(b.dueTime ?? ""));
  const untimed = undone.filter((t) => !t.dueTime);
  const now = nowHHMM();
  const nowIdx = timed.findIndex((t) => (t.dueTime ?? "") >= now);
  const nowMarkerAt = nowIdx === -1 ? timed.length : nowIdx;
  // ✨ Брифинг: обсяг + час (без дублювання «почни з» — це робить Жаба)
  const totalMin = undone.reduce((s, t) => s + (t.estimateMin ?? 0), 0);
  const timeStr = formatTotal(totalMin);
  const briefTop = undone[0];

  return (
    <section className="flex flex-1 flex-col px-5 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Сьогодні</h1>
      <p className="mt-1 text-sm capitalize text-muted">
        {today}
        {total > 0 && (
          <span className="lowercase">
            {" "}
            · {doneCount} із {total}
          </span>
        )}
      </p>

      {/* Розумний ранок: задачи с дедлайном на сегодня/просроченные, ещё не в плане */}
      {dueSuggestCount > 0 && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.08] px-4 py-3.5">
          <span className="text-xl leading-none">🌅</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Розумний ранок</p>
            <p className="text-xs text-muted">
              {dueSuggestCount} {pluralTask(dueSuggestCount)} із дедлайном на
              сьогодні ще не в плані
            </p>
          </div>
          <button
            type="button"
            onClick={onPlanDueToday}
            className="shrink-0 rounded-full bg-amber-400/20 px-4 py-2 text-xs font-semibold text-amber-400 transition-transform active:scale-95"
          >
            Додати
          </button>
        </div>
      )}

      {total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted">
          <IconTodayLarge />
          <p className="max-w-xs text-sm">
            План порожній. Надиктуй думки на екрані «Думки» — AI сам запропонує
            план на сьогодні. Або натисни ☀️ біля задач у «Вхідних».
          </p>
        </div>
      ) : undone.length === 0 ? (
        <>
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-accent/20 bg-accent/[0.08] px-4 py-3.5">
            <span className="text-lg leading-none">🎉</span>
            <p className="text-sm leading-relaxed">
              Усе на сьогодні зроблено. Красунчик — можна видихнути.
            </p>
          </div>
          {done.length > 0 && (
            <div className="mt-5 pb-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Зроблено · {done.length}
              </div>
              <ul className="flex flex-col gap-2">
                {done.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onToggleToday={onToggleToday}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <>
          {/* 🐸 Жаба дня — найважче зробити першим */}
          {frog && (
            <button
              type="button"
              onClick={() => onToggle(frog.id)}
              className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/[0.16] to-accent/[0.03] px-4 py-3.5 text-left transition-transform active:scale-[0.99]"
            >
              <span className="text-2xl leading-none">🐸</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                  Жаба дня
                </p>
                <p className="truncate text-[15px] font-medium">{frog.title}</p>
                <p className="text-xs text-muted">
                  Найважче — зроби першим, і день піде легше
                </p>
              </div>
            </button>
          )}

          {/* ✨ AI-брифинг */}
          <div className="mt-3 flex items-start gap-3 rounded-2xl border border-accent/20 bg-accent/[0.08] px-4 py-3.5">
            <span className="text-lg leading-none">✨</span>
            <p className="text-sm leading-relaxed">
              На сьогодні {undone.length} {pluralTask(undone.length)}
              {timeStr ? ` · ${timeStr}` : ""}.
              {!frog ? ` Почни з «${briefTop.title}».` : " Ти впораєшся 💪"}
            </p>
          </div>

          {/* ⚖️ 1-3-5: підказка про перевантаження (AI радить, вирішуєш ти) */}
          {overloaded && (
            <div className="mt-3 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">
              <span className="text-base leading-none">⚖️</span>
              <p className="text-xs leading-relaxed text-muted">
                План амбітний — {undone.length} задач. Правило{" "}
                <span className="font-medium text-foreground">1-3-5</span> радить:
                1 велика, 3 середні та 5 дрібних справ на день. Може, щось
                перенести на завтра?
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setFocus(true)}
            className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-base font-semibold text-white shadow-lg shadow-accent/25 transition-transform active:scale-[0.98]"
          >
            <IconBolt />
            Фокус — веди мене по плану
          </button>

          <div className="mt-6 flex flex-col gap-6 pb-6">
            {/* 📋 Розклад дня — задачи со временем */}
            {timed.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  <span>📋</span>
                  Розклад дня
                </div>
                <ul className="flex flex-col">
                  {timed.map((task, i) => (
                    <Fragment key={task.id}>
                      {i === nowMarkerAt && <NowMarker now={now} />}
                      <TimelineRow task={task} onToggle={onToggle} />
                    </Fragment>
                  ))}
                  {nowMarkerAt === timed.length && <NowMarker now={now} />}
                </ul>
              </div>
            )}

            {/* Задачи без времени — по приоритету */}
            {untimed.length > 0 && (
              <div className="flex flex-col gap-5">
                {timed.length > 0 && (
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Будь-коли
                  </div>
                )}
                {TIERS.map((tier) => {
                  const items = untimed.filter((t) => tierOf(t) === tier);
                  if (items.length === 0) return null;
                  const info = tierInfo[tier];
                  return (
                    <div key={tier}>
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                        <span>{info.emoji}</span>
                        {info.label}
                        <span className="text-muted/60">· {items.length}</span>
                      </div>
                      <ul className="flex flex-col gap-2">
                        {items.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            onToggle={onToggle}
                            onToggleToday={onToggleToday}
                          />
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}

            {done.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Зроблено · {done.length}
                </div>
                <ul className="flex flex-col gap-2">
                  {done.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={onToggle}
                      onToggleToday={onToggleToday}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

// Ряд ленты дня: час зліва, коннектор із точкою, картка справа
function TimelineRow({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (id: string) => void;
}) {
  return (
    <li className="flex gap-3">
      <span className="w-11 shrink-0 pt-3.5 text-right text-xs font-semibold text-accent">
        {task.dueTime}
      </span>
      <div className="relative flex-1 border-l-2 border-white/[0.06] pb-2 pl-4">
        <span className="absolute -left-[5px] top-4 h-2 w-2 rounded-full bg-accent" />
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          className="flex w-full items-start gap-3 rounded-2xl border border-white/[0.05] bg-surface px-4 py-3 text-left transition-transform active:scale-[0.99]"
        >
          <Checkbox done={task.done} />
          <div className="min-w-0 flex-1">
            <span
              className={`block text-[15px] ${task.done ? "text-muted line-through" : ""}`}
            >
              {task.title}
            </span>
            {!task.done && <TaskMeta task={task} hideTime />}
          </div>
        </button>
      </div>
    </li>
  );
}

// Тонкий маркер «зараз HH:MM» у стрічці дня
function NowMarker({ now }: { now: string }) {
  return (
    <li className="flex items-center gap-3 py-1.5">
      <span className="w-11 shrink-0 text-right text-[11px] font-semibold text-danger">
        {now}
      </span>
      <div className="flex flex-1 items-center gap-2 pl-4">
        <span className="h-2 w-2 rounded-full bg-danger" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-danger">
          зараз
        </span>
        <span className="h-px flex-1 bg-danger/25" />
      </div>
    </li>
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
    <li className="flex items-start gap-3 rounded-2xl border border-white/[0.05] bg-surface px-4 py-3.5">
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.done ? "Зняти позначку" : "Позначити виконаною"}
      >
        <Checkbox done={task.done} />
      </button>

      <div className="min-w-0 flex-1">
        <span
          className={`block text-[15px] ${task.done ? "text-muted line-through" : ""}`}
        >
          {task.title}
        </span>
        {!task.done && <TaskMeta task={task} />}
      </div>

      <button
        type="button"
        onClick={() => onToggleToday(task.id)}
        aria-label="Прибрати з плану на сьогодні"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted active:bg-surface-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
}
