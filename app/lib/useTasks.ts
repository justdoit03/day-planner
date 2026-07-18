"use client";

import { useEffect, useState } from "react";

// Схема задачи — «контракт» между интерфейсом и AI.
export type Task = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
  // Эти поля проставляет AI (Фаза 3):
  priority?: "low" | "medium" | "high";
  estimateMin?: number | null; // оценка времени в минутах
  dueDate?: string | null; // дедлайн, YYYY-MM-DD
};

// То, что возвращает сервер после разбора текста через Claude.
export type ParsedTask = {
  title: string;
  priority: "low" | "medium" | "high";
  estimateMin: number | null;
  dueDate: string | null;
};

const STORAGE_KEY = "day-planner:tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Читаем задачи из localStorage при первом запуске
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw));
    } catch {
      // если данные битые — просто начинаем с пустого списка
    }
    setLoaded(true);
  }, []);

  // Сохраняем задачи при каждом изменении
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, loaded]);

  // Добавляем задачи, разобранные AI на сервере
  function addParsed(parsed: ParsedTask[]): number {
    if (parsed.length === 0) return 0;
    const now = Date.now();
    const created: Task[] = parsed.map((p, i) => ({
      id: `${now}-${i}`,
      title: p.title,
      done: false,
      createdAt: now,
      priority: p.priority,
      estimateMin: p.estimateMin,
      dueDate: p.dueDate,
    }));
    setTasks((prev) => [...created, ...prev]);
    return created.length;
  }

  function toggle(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  function remove(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return { tasks, addParsed, toggle, remove, loaded };
}
