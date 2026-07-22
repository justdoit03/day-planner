"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import TabBar, { type TabKey } from "./components/TabBar";
import CaptureScreen from "./components/CaptureScreen";
import InboxScreen from "./components/InboxScreen";
import TodayScreen from "./components/TodayScreen";
import WeekScreen from "./components/WeekScreen";
import LoginScreen from "./components/LoginScreen";
import Onboarding from "./components/Onboarding";
import ProfileSheet from "./components/ProfileSheet";
import TaskEditorSheet from "./components/TaskEditorSheet";
import { useTasks, type Task, type TaskFields } from "./lib/useTasks";
import { isDueTodayOrOverdue } from "./lib/dates";

export default function Home() {
  const [tab, setTab] = useState<TabKey>("capture");
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [name, setName] = useState("");
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editor, setEditor] = useState<{ open: boolean; task: Task | null }>({
    open: false,
    task: null,
  });

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

  function saveName(newName: string) {
    supabase.auth.updateUser({ data: { name: newName } });
    setName(newName.split(" ")[0]);
  }

  const {
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
  } = useTasks(
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
      if (!res.ok) return data?.error ?? "Щось пішло не так.";

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
      return "Немає зв'язку з сервером. Перевір інтернет.";
    }
  }

  function handleEditorSave(fields: TaskFields) {
    if (editor.task) update(editor.task.id, fields);
    else addManual(fields);
  }

  const todayTasks = tasks.filter((t) => t.today);
  // Для «Розумного ранку»: задачи с дедлайном сегодня/просроченные, ещё не в плане
  const dueSuggestCount = tasks.filter(
    (t) => !t.done && !t.today && isDueTodayOrOverdue(t.dueDate)
  ).length;

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
        onClick={() => setProfileOpen(true)}
        aria-label="Профіль"
        className="absolute right-4 top-3 z-10 active:scale-95"
      >
        {session.user.user_metadata?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.user_metadata.avatar_url as string}
            alt=""
            className="h-9 w-9 rounded-full border border-border"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
            {(name || "?").slice(0, 1).toUpperCase()}
          </span>
        )}
      </button>

      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        avatarUrl={(session.user.user_metadata?.avatar_url as string) ?? null}
        name={name}
        email={session.user.email ?? ""}
        tasks={tasks}
        onSaveName={saveName}
        onSignOut={() => {
          setProfileOpen(false);
          supabase.auth.signOut();
        }}
      />

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
              onEdit={(task) => setEditor({ open: true, task })}
              onAdd={() => setEditor({ open: true, task: null })}
              onClearDone={clearDone}
            />
          )}
          {tab === "today" && (
            <TodayScreen
              tasks={todayTasks}
              onToggle={toggle}
              onToggleToday={toggleToday}
              dueSuggestCount={dueSuggestCount}
              onPlanDueToday={planDueToday}
            />
          )}
          {tab === "week" && <WeekScreen tasks={tasks} onToggle={toggle} />}
        </div>
      </main>
      <TaskEditorSheet
        open={editor.open}
        task={editor.task}
        onClose={() => setEditor({ open: false, task: null })}
        onSave={handleEditorSave}
      />

      {pendingDelete && (
        <div className="animate-fade-in fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-foreground py-2.5 pl-5 pr-2.5 text-background shadow-xl">
          <span className="text-sm">Задачу видалено</span>
          <button
            type="button"
            onClick={undoDelete}
            className="rounded-full bg-background/20 px-3.5 py-1.5 text-sm font-semibold text-background"
          >
            Повернути
          </button>
        </div>
      )}

      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
