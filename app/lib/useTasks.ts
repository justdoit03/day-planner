"use client";

import { useEffect, useState } from "react";

// Схема задачи — «контракт» между интерфейсом и будущим AI (Фаза 3).
export type Task = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
  // Эти поля пока не заполняются — их будет проставлять AI на Фазе 3:
  priority?: "low" | "medium" | "high";
  estimateMin?: number; // оценка времени в минутах
  dueDate?: string; // дедлайн, ISO-строка
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

  // Разбираем текст: каждая непустая строка → отдельная задача
  function addFromText(text: string): number {
    const titles = text
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    if (titles.length === 0) return 0;

    const now = Date.now();
    const created: Task[] = titles.map((title, i) => ({
      id: `${now}-${i}`,
      title,
      done: false,
      createdAt: now,
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

  return { tasks, addFromText, toggle, remove, loaded };
}
