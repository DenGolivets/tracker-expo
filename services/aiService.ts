const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

if (!API_KEY) {
  console.warn("Missing EXPO_PUBLIC_GROQ_API_KEY in .env");
}

export interface NutritionPlan {
  dailyCalories: number;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
  waterIntake: string;
  advice: string;
}

export const generateNutritionPlan = async (
  userData: any,
): Promise<NutritionPlan> => {
  try {
    if (!API_KEY) {
      throw new Error(
        "API ключ отсутствует. Пожалуйста, добавьте EXPO_PUBLIC_GROQ_API_KEY в ваш файл .env и перезапустите сервер.",
      );
    }

    const prompt = `
      Сгенерируй персонализированный план питания на основе следующих данных пользователя:
      - Пол: ${userData.gender}
      - Цель: ${userData.goal}
      - Частота тренировок: ${userData.workoutFrequency} дней в неделю
      - Рост: ${userData.heightFeet}фт ${userData.heightInches}дюймов
      - Вес: ${userData.weightKg}кг
      - Дата рождения: ${userData.birthdate}

      Пожалуйста, предоставь ответ в валидном формате JSON со следующей структурой (все текстовые поля должны быть на русском языке):
      {
        "dailyCalories": number,
        "macros": {
          "protein": "строка (например, 150г)",
          "carbs": "строка (например, 200г)",
          "fats": "строка (например, 70г)"
        },
        "waterIntake": "строка (например, 3 литра)",
        "advice": "строка (краткий совет по питанию на основе цели)"
      }
      Не включай markdown форматирование, такое как \`\`\`json. Только "сырой" JSON объект.
    `;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка API Groq: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Не получен контент от API Groq");
    }

    const plan: NutritionPlan = JSON.parse(content);
    return plan;
  } catch (error: any) {
    console.error("Ошибка генерации плана питания:", error);
    throw error; // Re-throw the error so the UI can display it
  }
};
