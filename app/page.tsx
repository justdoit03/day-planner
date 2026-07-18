"use client";

import { useState } from "react";
import TabBar, { type TabKey } from "./components/TabBar";
import CaptureScreen from "./components/CaptureScreen";
import InboxScreen from "./components/InboxScreen";
import TodayScreen from "./components/TodayScreen";
import { useTasks } from "./lib/useTasks";

export default function Home() {
  const [tab, setTab] = useState<TabKey>("capture");
  const { tasks, addParsed, toggle, remove, toggleToday } = useTasks();

  async function handleCapture(text: string): Promise<string | null> {
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) return data?.error ?? "Что-то пошло не так.";

      const added = addParsed(data.tasks ?? []);
      if (added > 0) setTab("inbox"); // после разбора показываем Входящие
      return null; // успех
    } catch {
      return "Нет связи с сервером. Проверь интернет.";
    }
  }

  const todayTasks = tasks.filter((t) => t.today);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-border sm:border-x">
      <main className="flex flex-1 flex-col overflow-y-auto">
        {tab === "capture" && <CaptureScreen onCapture={handleCapture} />}
        {tab === "inbox" && (
          <InboxScreen
            tasks={tasks}
            onToggle={toggle}
            onDelete={remove}
            onToggleToday={toggleToday}
          />
        )}
        {tab === "today" && (
          <TodayScreen
            tasks={todayTasks}
            onToggle={toggle}
            onToggleToday={toggleToday}
          />
        )}
      </main>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
