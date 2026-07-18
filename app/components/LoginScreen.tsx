"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const canSend = /\S+@\S+\.\S+/.test(email) && status !== "sending";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setStatus("sending");
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setError("Не получилось отправить письмо. Проверь адрес и попробуй ещё раз.");
      setStatus("idle");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Планер дня</h1>
        <p className="mt-2 text-sm text-muted">
          Вывали мысли — AI соберёт из них план на день
        </p>
      </div>

      {status === "sent" ? (
        <div className="rounded-2xl bg-surface px-5 py-6 text-center">
          <div className="mb-2 text-3xl">📬</div>
          <p className="text-[15px] font-medium">Письмо отправлено</p>
          <p className="mt-1 text-sm text-muted">
            Открой письмо на <span className="text-foreground">{email}</span> и нажми
            ссылку — вернёшься сюда уже внутри.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-4 text-sm text-accent"
          >
            Ввести другой email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="твой@email.com"
            className="h-14 w-full rounded-2xl bg-surface px-5 text-base placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          {error && (
            <p className="rounded-xl bg-accent/15 px-4 py-2 text-sm text-accent">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!canSend}
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-all ${
              canSend
                ? "bg-accent text-white active:scale-[0.98]"
                : "bg-surface-2 text-muted"
            }`}
          >
            {status === "sending" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              "Войти по email"
            )}
          </button>
          <p className="mt-1 text-center text-xs text-muted">
            Пароль не нужен — пришлём ссылку для входа.
          </p>
        </form>
      )}
    </div>
  );
}
