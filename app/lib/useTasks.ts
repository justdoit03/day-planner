"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./supabase";
import { isDueTodayOrOverdue } from "./dates";

// Схема задачи — «контракт» между интерфейсом и AI.
export type Task = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
  today?: boolean;
  priority?: "low" | "medium" | "high";
  estimateMin?: number | null;
  dueDate?: string | null;
  dueTime?: string | null; // время «HH:MM», на которое назначена задача
};

// Поля для ручного создания/редактирования задачи.
export type TaskFields = {
  title: string;
  priority: "low" | "medium" | "high";
  estimateMin: number | null;
  dueDate: string | null;
  dueTime: string | null;
  today: boolean;
};

// То, что возвращает сервер после разбора текста через Claude.
export type ParsedTask = {
  title: string;
  priority: "low" | "medium" | "high";
  estimateMin: number | null;
  dueDate: string | null;
  dueTime?: string | null;
  forToday?: boolean; // AI предложил взять в план на сегодня
};

// Строка из базы (snake_case) → задача в приложении (camelCase)
type Row = {
  id: string;
  title: string;
  done: boolean;
  today: boolean;
  priority: "low" | "medium" | "high" | null;
  estimate_min: number | null;
  due_date: string | null;
  due_time: string | null;
  created_at: string;
};

function fromRow(r: Row): Task {
  return {
    id: r.id,
    title: r.title,
    done: r.done,
    today: r.today,
    priority: r.priority ?? undefined,
    estimateMin: r.estimate_min,
    dueDate: r.due_date,
    dueTime: r.due_time,
    createdAt: new Date(r.created_at).getTime(),
  };
}

// Задачи хранятся в облаке (Supabase), привязаны к вошедшему пользователю (RLS).
export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setTasks([]);
      setLoaded(true);
      return;
    }
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setTasks((data as Row[]).map(fromRow));
    setLoaded(true);
  }, [userId]);

  useEffect(() => {
    setLoaded(false);
    load();
  }, [load]);

  // Сохраняем задачи, разобранные AI
  async function addParsed(parsed: ParsedTask[]): Promise<number> {
    if (parsed.length === 0) return 0;
    const rows = parsed.map((p) => ({
      title: p.title,
      priority: p.priority,
      estimate_min: p.estimateMin,
      due_date: p.dueDate,
      due_time: p.dueTime ?? null,
      done: false,
      today: p.forToday === true, // AI сам предложил план на сегодня
    }));
    const { data, error } = await supabase.from("tasks").insert(rows).select();
    if (error || !data) return 0;
    setTasks((prev) => [...(data as Row[]).map(fromRow), ...prev]);
    return data.length;
  }

  async function toggle(id: string) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    const nextDone = !t.done;
    // completed_at — момент выполнения (для стрика и статистики); при снятии — null
    const completedAt = nextDone ? new Date().toISOString() : null;
    setTasks((prev) =>
      prev.map((x) => (x.id === id ? { ...x, done: nextDone } : x))
    );
    await supabase
      .from("tasks")
      .update({ done: nextDone, completed_at: completedAt })
      .eq("id", id);
  }

  async function toggleToday(id: string) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setTasks((prev) =>
      prev.map((x) => (x.id === id ? { ...x, today: !x.today } : x))
    );
    await supabase.from("tasks").update({ today: !t.today }).eq("id", id);
  }

  // Мягкое удаление: 5 секунд можно передумать («Повернути»)
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const pendingRef = useRef<{
    task: Task;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);

  function finalizeDelete() {
    if (!pendingRef.current) return;
    clearTimeout(pendingRef.current.timer);
    const t = pendingRef.current.task;
    pendingRef.current = null;
    setPendingDelete(null);
    supabase.from("tasks").delete().eq("id", t.id);
  }

  function remove(id: string) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    finalizeDelete(); // если что-то уже ждало удаления — удаляем окончательно
    setTasks((prev) => prev.filter((x) => x.id !== id));
    const timer = setTimeout(() => {
      pendingRef.current = null;
      setPendingDelete(null);
      supabase.from("tasks").delete().eq("id", id);
    }, 5000);
    pendingRef.current = { task: t, timer };
    setPendingDelete(t);
  }

  function undoDelete() {
    if (!pendingRef.current) return;
    clearTimeout(pendingRef.current.timer);
    const t = pendingRef.current.task;
    pendingRef.current = null;
    setPendingDelete(null);
    setTasks((prev) =>
      [...prev, t].sort((a, b) => b.createdAt - a.createdAt)
    );
  }

  // «Розумний ранок»: собрать в план на сегодня все задачи, у которых дедлайн
  // сегодня или уже прошёл (и которые ещё не в плане и не выполнены).
  async function planDueToday(): Promise<number> {
    const ids = tasks
      .filter((t) => !t.done && !t.today && isDueTodayOrOverdue(t.dueDate))
      .map((t) => t.id);
    if (ids.length === 0) return 0;
    setTasks((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, today: true } : t))
    );
    await supabase.from("tasks").update({ today: true }).in("id", ids);
    return ids.length;
  }

  // Удалить все выполненные задачи разом
  async function clearDone() {
    const ids = tasks.filter((t) => t.done).map((t) => t.id);
    if (ids.length === 0) return;
    setTasks((prev) => prev.filter((t) => !t.done));
    await supabase.from("tasks").delete().in("id", ids);
  }

  // Ручное создание задачи (шит «Нова задача»)
  async function addManual(f: TaskFields): Promise<boolean> {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: f.title,
        priority: f.priority,
        estimate_min: f.estimateMin,
        due_date: f.dueDate,
        due_time: f.dueTime,
        today: f.today,
        done: false,
      })
      .select();
    if (error || !data) return false;
    setTasks((prev) => [...(data as Row[]).map(fromRow), ...prev]);
    return true;
  }

  // Редактирование задачи (шит правки)
  async function update(id: string, f: TaskFields) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              title: f.title,
              priority: f.priority,
              estimateMin: f.estimateMin,
              dueDate: f.dueDate,
              dueTime: f.dueTime,
              today: f.today,
            }
          : t
      )
    );
    await supabase
      .from("tasks")
      .update({
        title: f.title,
        priority: f.priority,
        estimate_min: f.estimateMin,
        due_date: f.dueDate,
        due_time: f.dueTime,
        today: f.today,
      })
      .eq("id", id);
  }

  return {
    tasks,
    addParsed,
    addManual,
    update,
    toggle,
    remove,
    clearDone,
    planDueToday,
    undoDelete,
    pendingDelete,
    toggleToday,
    loaded,
  };
}
