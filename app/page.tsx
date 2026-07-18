"use client";

import { useState } from "react";
import TabBar, { type TabKey } from "./components/TabBar";
import CaptureScreen from "./components/CaptureScreen";
import InboxScreen from "./components/InboxScreen";
import TodayScreen from "./components/TodayScreen";
import { useTasks } from "./lib/useTasks";

export default function Home() {
  const [tab, setTab] = useState<TabKey>("capture");
  const { tasks, addFromText, toggle, remove } = useTasks();

  function handleCapture(text: string) {
    const added = addFromText(text);
    if (added > 0) setTab("inbox"); // после разбора показываем Входящие
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-border sm:border-x">
      <main className="flex flex-1 flex-col overflow-y-auto">
        {tab === "capture" && <CaptureScreen onCapture={handleCapture} />}
        {tab === "inbox" && (
          <InboxScreen tasks={tasks} onToggle={toggle} onDelete={remove} />
        )}
        {tab === "today" && <TodayScreen />}
      </main>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
