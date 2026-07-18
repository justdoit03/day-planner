import { createClient } from "@supabase/supabase-js";

// Клиент Supabase для браузера. URL и anon-ключ публичные (защита — правила RLS в базе).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
