
import { GoogleGenAI, Type } from "@google/genai";
import { DetectionResponse, SupportedLanguage, ClassificationLabel } from "../types";

const API_KEY = process.env.API_KEY || "";

export const analyzeVoice = async (
  audioBase64: string, 
  language: SupportedLanguage
): Promise<DetectionResponse> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `You are an expert audio forensic system. 
  Classify the provided audio as either 'AI_GENERATED' or 'HUMAN'. 
  Supported languages: Tamil, English, Hindi, Malayalam, Telugu.
  Analyze spectral artifacts, pitch stability, and linguistic prosody specific to ${language}.
  Strictly follow the output schema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: `Analyze this ${language} audio. Classify it as AI_GENERATED or HUMAN.` },
            {
              inlineData: {
                data: audioBase64,
                mimeType: 'audio/mp3'
              }
            }
          ]
        }
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ['success'] },
            language: { type: Type.STRING },
            classification: { type: Type.STRING, enum: ['AI_GENERATED', 'HUMAN'] },
            confidenceScore: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ["status", "language", "classification", "confidenceScore", "explanation"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as DetectionResponse;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      status: 'error',
      message: "Neural inference failed. Potential causes: malformed audio or API key issue."
    };
  }
};
