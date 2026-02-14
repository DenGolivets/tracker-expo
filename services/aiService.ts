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
        "API ключ відсутній. Будь ласка, додайте EXPO_PUBLIC_GROQ_API_KEY у ваш файл .env та перезапустіть сервер.",
      );
    }

    const prompt = `
      Згенеруй персоналізований план харчування на основі наступних даних користувача:
      - Стать: ${userData.gender}
      - Мета: ${userData.goal}
      - Частота тренувань: ${userData.workoutFrequency} днів на тиждень
      - Зріст: ${userData.heightFeet}фт ${userData.heightInches}дюймів
      - Вага: ${userData.weightKg}кг
      - Дата народження: ${userData.birthdate}

      Будь ласка, надай відповідь у валідному форматі JSON з наступною структурою (всі текстові поля мають бути українською мовою):
      {
        "dailyCalories": number,
        "macros": {
          "protein": "рядок (наприклад, 150г)",
          "carbs": "рядок (наприклад, 200г)",
          "fats": "рядок (наприклад, 70г)"
        },
        "waterIntake": "рядок (наприклад, 3 літри)",
        "advice": "рядок (коротка порада щодо харчування на основі мети)"
      }
      Не включай markdown форматування, таке як \`\`\`json. Тільки "сирий" JSON об'єкт.
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
      throw new Error(`Помилка API Groq: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Не отримано контент від API Groq");
    }

    const plan: NutritionPlan = JSON.parse(content);
    return plan;
  } catch (error: any) {
    console.error("Помилка генерації плану харчування:", error);
    throw error; // Re-throw the error so the UI can display it
  }
};
