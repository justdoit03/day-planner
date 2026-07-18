"use client";

function IconInboxLarge() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  );
}

export default function InboxScreen() {
  return (
    <section className="flex flex-1 flex-col px-5 pt-8">
      <h1 className="text-2xl font-semibold tracking-tight">Входящие</h1>
      <p className="mt-1 text-sm text-muted">
        Сюда попадут задачи из твоих мыслей
      </p>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-muted">
        <IconInboxLarge />
        <p className="max-w-xs text-sm">
          Пока пусто. Надиктуй или напиши что-нибудь на экране «Захват».
        </p>
      </div>
    </section>
  );
}
