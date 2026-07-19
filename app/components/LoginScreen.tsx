"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5.4 0 10.3-2.1 14-5.4l-6.5-5.5c-2 1.5-4.6 2.4-7.5 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39 16.2 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.5 5.5c-.5.4 6.7-4.9 6.7-15 0-1.2-.1-2.3-.9-3.5z" />
    </svg>
  );
}

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInGoogle() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError("Не вдалося почати вхід. Спробуй ще раз.");
      setLoading(false);
    }
    // при успехе браузер сам уходит на Google
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
      <div className="mb-10 text-center">
        {/* Мини-логотип */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#8280ff] to-[#5a57e6] shadow-lg shadow-accent/30">
          <svg width="30" height="30" viewBox="0 0 512 512" fill="none">
            <path d="M292 84 152 300h86l-22 128 168-212h-92z" fill="#fff" />
          </svg>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">Ясно</h1>
        <p className="mt-2 text-sm text-muted">
          Скажи, що в голові — стане ясно, що робити
        </p>
      </div>

      {error && (
        <p className="mb-3 rounded-xl bg-danger/15 px-4 py-2 text-center text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={signInGoogle}
        disabled={loading}
        className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white text-base font-semibold text-zinc-900 transition-all active:scale-[0.98] disabled:opacity-70"
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900" />
        ) : (
          <>
            <GoogleIcon />
            Увійти через Google
          </>
        )}
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        Швидкий вхід в один тап. Пароль не потрібен.
      </p>
    </div>
  );
}
