"use client";

import { useState } from "react";
import TabBar, { type TabKey } from "./components/TabBar";
import CaptureScreen from "./components/CaptureScreen";
import InboxScreen from "./components/InboxScreen";
import TodayScreen from "./components/TodayScreen";

export default function Home() {
  const [tab, setTab] = useState<TabKey>("capture");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-border sm:border-x">
      <main className="flex flex-1 flex-col overflow-y-auto">
        {tab === "capture" && <CaptureScreen />}
        {tab === "inbox" && <InboxScreen />}
        {tab === "today" && <TodayScreen />}
      </main>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
