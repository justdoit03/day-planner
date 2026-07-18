"use client";

function IconTodayLarge() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}

export default function TodayScreen() {
  const today = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="flex flex-1 flex-col px-5 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Сегодня</h1>
      <p className="mt-1 text-sm text-muted capitalize">{today}</p>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted">
        <IconTodayLarge />
        <p className="max-w-xs text-sm">
          План на сегодня появится здесь, когда выберешь задачи из «Входящих».
        </p>
      </div>
    </section>
  );
}
