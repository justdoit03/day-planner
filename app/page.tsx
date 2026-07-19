"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import TabBar, { type TabKey } from "./components/TabBar";
import CaptureScreen from "./components/CaptureScreen";
import InboxScreen from "./components/InboxScreen";
import TodayScreen from "./components/TodayScreen";
import LoginScreen from "./components/LoginScreen";
import Onboarding from "./components/Onboarding";
import { useTasks } from "./lib/useTasks";

export default function Home() {
  const [tab, setTab] = useState<TabKey>("capture");
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [name, setName] = useState("");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Следим за входом/выходом
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Имя (из Google или заданное) + показать онбординг при первом входе
  useEffect(() => {
    const user = session?.user;
    if (!user) return;
    const meta = user.user_metadata ?? {};
    const full = (meta.name || meta.full_name || "") as string;
    setName(full.split(" ")[0] || "");
    const key = `day-planner:onboarded:${user.id}`;
    setNeedsOnboarding(!localStorage.getItem(key));
  }, [session]);

  function finishOnboarding(finalName: string) {
    const user = session?.user;
    const clean = finalName.trim();
    if (user) {
      if (clean) supabase.auth.updateUser({ data: { name: clean } });
      localStorage.setItem(`day-planner:onboarded:${user.id}`, "1");
    }
    if (clean) setName(clean.split(" ")[0]);
    setNeedsOnboarding(false);
  }

  const { tasks, addParsed, toggle, remove, toggleToday } = useTasks(
    session?.user?.id ?? null
  );

  async function handleCapture(text: string): Promise<string | null> {
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) return data?.error ?? "Что-то пошло не так.";

      const parsed = data.tasks ?? [];
      const added = await addParsed(parsed);
      if (added > 0) {
        // Если AI собрал план на сегодня — показываем «Сегодня», иначе «Входящие»
        const anyToday = parsed.some(
          (t: { forToday?: boolean }) => t.forToday === true
        );
        setTab(anyToday ? "today" : "inbox");
      }
      return null;
    } catch {
      return "Нет связи с сервером. Проверь интернет.";
    }
  }

  const todayTasks = tasks.filter((t) => t.today);

  // Ждём проверку сессии, чтобы не мигал экран входа
  if (!authReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (needsOnboarding) {
    return <Onboarding initialName={name} onDone={finishOnboarding} />;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-border sm:border-x">
      <button
        type="button"
        onClick={() => supabase.auth.signOut()}
        className="absolute right-4 top-3 z-10 text-xs text-muted active:text-foreground"
      >
        Выйти
      </button>

      <main className="flex flex-1 flex-col overflow-y-auto">
        <div key={tab} className="animate-fade-in flex flex-1 flex-col">
          {tab === "capture" && (
            <CaptureScreen onCapture={handleCapture} name={name} />
          )}
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
        </div>
      </main>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
