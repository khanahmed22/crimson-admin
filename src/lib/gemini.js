import { GoogleGenAI } from "@google/genai";
import { cleanOCRText } from "./ocrCleanup";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_KEY,
});

const SYSTEM_PROMPT = `
Extract food items from restaurant menu text.

Return JSON ONLY.

Schema:
{
  "items": [
    {
      "foodName": "",
      "price": 0,
      "category": "",
      "description": "",
      "discount": 0,
      "stockAmount": 0
    }
  ]
}

Rules:
- price must be a number
- infer category
- missing values = 0
`;

export async function parseMenuWithGemini(rawText) {
  const cleaned = cleanOCRText(rawText).slice(0, 6000); // HARD input cap

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: SYSTEM_PROMPT + "\n\n" + cleaned,
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 600,
      },
    });

    const text = response.text.trim();

    const cleanJSON = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJSON);

    // Deduplicate by foodName
    const unique = Object.values(
      parsed.items.reduce((acc, item) => {
        acc[item.foodName.toLowerCase()] ??= item;
        return acc;
      }, {})
    );

    return { items: unique };
  } catch (err) {
    console.error("Gemini parsing failed:", err);
    return { items: [] };
  }
}
