import Anthropic from "@anthropic-ai/sdk";

// Схема ответа — заставляем модель вернуть строго такой JSON.
const schema = {
  type: "object",
  properties: {
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          estimateMin: { anyOf: [{ type: "integer" }, { type: "null" }] },
          dueDate: { anyOf: [{ type: "string" }, { type: "null" }] },
        },
        required: ["title", "priority", "estimateMin", "dueDate"],
        additionalProperties: false,
      },
    },
  },
  required: ["tasks"],
  additionalProperties: false,
} as const;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Ключ Anthropic не настроен на сервере." },
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

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      system:
        "Ты — парсер задач для планировщика дня. На вход даётся хаотичный текст, " +
        "который пользователь надиктовал или написал. Разбей его на отдельные конкретные задачи.\n" +
        "Для каждой задачи определи:\n" +
        "- title: краткая понятная формулировка на языке пользователя, с заглавной буквы, без лишних слов.\n" +
        "- priority: 'high' — срочное/важное или с близким дедлайном; 'medium' — обычное; 'low' — мелочь/необязательное.\n" +
        "- estimateMin: оценка времени в минутах (целое число). null, если оценить нельзя.\n" +
        "- dueDate: дата дедлайна в формате YYYY-MM-DD, если в тексте есть срок ('до пятницы', 'завтра', 'к 20-му'). Иначе null.\n" +
        `Сегодня ${today}. Не выдумывай задачи, которых нет в тексте. Одна мысль — одна задача.`,
      messages: [{ role: "user", content: text }],
      output_config: {
        format: { type: "json_schema", schema },
      },
    });

    const block = response.content.find((b) => b.type === "text");
    const raw = block && "text" in block ? block.text : "{}";
    const data = JSON.parse(raw);

    return Response.json({ tasks: Array.isArray(data.tasks) ? data.tasks : [] });
  } catch (err) {
    console.error("Ошибка разбора задач:", err);
    return Response.json(
      { error: "Не удалось разобрать задачи. Попробуй ещё раз." },
      { status: 500 }
    );
  }
}
