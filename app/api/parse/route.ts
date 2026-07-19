// Разбор хаотичного текста на задачи через OpenRouter (модель Claude Haiku 4.5).
// Ключ читается из окружения на сервере — в браузер не попадает.

type ParsedTask = {
  title: string;
  priority: "low" | "medium" | "high";
  estimateMin: number | null;
  dueDate: string | null;
  forToday: boolean; // AI решил, что это стоит сделать сегодня
};

// Достаём JSON из ответа модели, даже если вокруг него есть лишний текст.
function extractJson(text: string): { tasks?: unknown } {
  try {
    return JSON.parse(text);
  } catch {
    // ignore
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      // ignore
    }
  }
  return {};
}

// Чистим и проверяем задачи от модели — не доверяем ответу вслепую.
function normalize(tasks: unknown): ParsedTask[] {
  if (!Array.isArray(tasks)) return [];
  const priorities = ["low", "medium", "high"];
  return tasks
    .filter(
      (t): t is Record<string, unknown> =>
        !!t && typeof (t as Record<string, unknown>).title === "string"
    )
    .map((t) => {
      const priority = priorities.includes(t.priority as string)
        ? (t.priority as "low" | "medium" | "high")
        : "medium";
      const estimateMin =
        typeof t.estimateMin === "number" ? t.estimateMin : null;
      const dueDate =
        typeof t.dueDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate)
          ? t.dueDate
          : null;
      const forToday = t.forToday === true;
      return {
        title: String(t.title).trim(),
        priority,
        estimateMin,
        dueDate,
        forToday,
      };
    })
    .filter((t) => t.title.length > 0);
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Ключ OpenRouter не настроен на сервере." },
      { status: 500 }
    );
  }

  let text = "";
  try {
    const body = await req.json();
    text = (body?.text ?? "").toString();
  } catch {
    return Response.json({ error: "Некорректный запрос." }, { status: 400 });
  }

  if (!text.trim()) {
    return Response.json({ tasks: [] });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const system =
    "Ты — парсер задач для планировщика дня. На вход даётся хаотичный текст, " +
    "который пользователь надиктовал или написал. Разбей его на отдельные конкретные задачи.\n" +
    "Ответь СТРОГО валидным JSON такого вида (без markdown, без пояснений, без ```):\n" +
    '{"tasks":[{"title":"...","priority":"low|medium|high","estimateMin":30,"dueDate":"2026-07-20","forToday":true}]}\n' +
    "Правила по полям:\n" +
    "- title: краткая понятная формулировка на языке пользователя, с заглавной буквы, без лишних слов.\n" +
    "- priority: 'high' — срочное/важное или с близким дедлайном; 'medium' — обычное; 'low' — мелочь.\n" +
    "- estimateMin: оценка времени в минутах (целое число) или null, если оценить нельзя.\n" +
    "- dueDate: дата в формате YYYY-MM-DD, если в тексте есть срок ('до пятницы', 'завтра', 'к 20-му'); иначе null.\n" +
    "- forToday: true ТОЛЬКО для того, что реально важно и срочно сделать именно сегодня " +
    "(срочное; дедлайн сегодня или просрочен; явные 'сегодня', 'сейчас', 'вечером', 'до конца дня'). " +
    "Это реалистичный план на день — обычно 3–7 задач, НЕ больше. Всё остальное forToday=false " +
    "(попадёт в общий список задач, но не в план на сегодня).\n" +
    `Сегодня ${today}. Не выдумывай задачи, которых нет в тексте. Одна мысль — одна задача.`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "Day Planner",
      },
      body: JSON.stringify({
        model: "anthropic/claude-haiku-4.5",
        max_tokens: 2000,
        messages: [
          { role: "system", content: system },
          { role: "user", content: text },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("OpenRouter error:", res.status, detail);
      return Response.json(
        { error: "Не удалось разобрать задачи. Попробуй ещё раз." },
        { status: 500 }
      );
    }

    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    const tasks = normalize(extractJson(content).tasks);
    return Response.json({ tasks });
  } catch (err) {
    console.error("Ошибка разбора задач:", err);
    return Response.json(
      { error: "Не удалось разобрать задачи. Попробуй ещё раз." },
      { status: 500 }
    );
  }
}
