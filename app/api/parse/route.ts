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
      { error: "Ключ OpenRouter не налаштовано на сервері." },
      { status: 500 }
    );
  }

  let text = "";
  try {
    const body = await req.json();
    text = (body?.text ?? "").toString();
  } catch {
    return Response.json({ error: "Некоректний запит." }, { status: 400 });
  }

  if (!text.trim()) {
    return Response.json({ tasks: [] });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const system =
    "Ти — парсер задач для планувальника дня. На вхід дається хаотичний текст, " +
    "який користувач надиктував або написав. Розбий його на окремі конкретні задачі.\n" +
    "Відповідай СУВОРО валідним JSON такого вигляду (без markdown, без пояснень, без ```):\n" +
    '{"tasks":[{"title":"...","priority":"low|medium|high","estimateMin":30,"dueDate":"2026-07-20","forToday":true}]}\n' +
    "Правила щодо полів:\n" +
    "- title: коротке зрозуміле формулювання мовою користувача (за замовчуванням українською), " +
    "з великої літери, без зайвих слів.\n" +
    "- priority: 'high' — термінове/важливе або з близьким дедлайном; 'medium' — звичайне; 'low' — дрібниця.\n" +
    "- estimateMin: оцінка часу в хвилинах (ціле число) або null, якщо оцінити неможливо.\n" +
    "- dueDate: дата у форматі YYYY-MM-DD, якщо в тексті є строк ('до п'ятниці', 'завтра', 'до 20-го'); інакше null.\n" +
    "- forToday: true ЛИШЕ для того, що реально важливо і терміново зробити саме сьогодні " +
    "(термінове; дедлайн сьогодні або прострочений; явні 'сьогодні', 'зараз', 'ввечері', 'до кінця дня'). " +
    "Це реалістичний план на день — зазвичай 3–7 задач, НЕ більше. Усе інше forToday=false " +
    "(потрапить до загального списку задач, але не в план на сьогодні).\n" +
    `Сьогодні ${today}. Не вигадуй задач, яких немає в тексті. Одна думка — одна задача.`;

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
        { error: "Не вдалося розібрати задачі. Спробуй ще раз." },
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
      { error: "Не вдалося розібрати задачі. Спробуй ще раз." },
      { status: 500 }
    );
  }
}
