"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

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
};

// То, что возвращает сервер после разбора текста через Claude.
export type ParsedTask = {
  title: string;
  priority: "low" | "medium" | "high";
  estimateMin: number | null;
  dueDate: string | null;
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
      done: false,
      today: false,
    }));
    const { data, error } = await supabase.from("tasks").insert(rows).select();
    if (error || !data) return 0;
    setTasks((prev) => [...(data as Row[]).map(fromRow), ...prev]);
    return data.length;
  }

  async function toggle(id: string) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setTasks((prev) =>
      prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x))
    );
    await supabase.from("tasks").update({ done: !t.done }).eq("id", id);
  }

  async function toggleToday(id: string) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setTasks((prev) =>
      prev.map((x) => (x.id === id ? { ...x, today: !x.today } : x))
    );
    await supabase.from("tasks").update({ today: !t.today }).eq("id", id);
  }

  async function remove(id: string) {
    setTasks((prev) => prev.filter((x) => x.id !== id));
    await supabase.from("tasks").delete().eq("id", id);
  }

  return { tasks, addParsed, toggle, remove, toggleToday, loaded };
}
