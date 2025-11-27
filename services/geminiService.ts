import { GoogleGenAI, Chat } from "@google/genai";

// Lazy initialization to prevent crash on load if key is missing
let ai: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!ai) {
    // Fallback to a dummy key to prevent crash during initialization
    // The actual calls will fail gracefully if the key is invalid
    const apiKey = process.env.API_KEY || "dummy_key_to_prevent_crash";
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const SYSTEM_INSTRUCTION = `
You are a polite, knowledgeable Islamic Assistant for "Smart Madrasa Pro".
Your goal is to assist in Bengali or English.
Always begin with "Bismillah" or an Islamic greeting when appropriate.
If asked for religious rulings (Fatwa), politely advise consulting a Mufti, but provide general references from Quran and Sunnah.
`;

export const startChatSession = (): Chat => {
  try {
    return getAiClient().chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  } catch (error) {
    console.error("Failed to start chat session:", error);
    // Return a dummy object or throw handled error
    throw error;
  }
};

export const generateNotice = async (topic: string, language: 'en' | 'bn'): Promise<string> => {
  const prompt = `
    Draft a formal Madrasa notice in ${language === 'bn' ? 'Bengali' : 'English'}.
    Topic: ${topic}
    Format: HTML (inside a <div>), professional styling.
    Include placeholders for Date and Signature.
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Failed to generate notice.";
  } catch (e) {
    console.error("AI Error:", e);
    return "Error connecting to AI. Please check your internet or API Key.";
  }
};

export const generateResultComment = async (studentName: string, marks: number, subject: string, language: 'en' | 'bn'): Promise<string> => {
  const prompt = `
    Write a short, encouraging report card remark for a student.
    Name: ${studentName}
    Subject: ${subject}
    Marks: ${marks}/100
    Language: ${language === 'bn' ? 'Bengali' : 'English'}
    Tone: Islamic, encouraging, constructive.
  `;
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (e) {
    return "Error.";
  }
};

export const generateQuestionPaper = async (
  subject: string,
  className: string,
  topics: string,
  marks: string,
  language: 'en' | 'bn'
): Promise<string> => {
  const prompt = `
    Create a Madrasa exam question paper in ${language === 'bn' ? 'Bengali' : 'English'}.
    Subject: ${subject}
    Class: ${className}
    Topics: ${topics}
    Total Marks: ${marks}
    
    Output Format: HTML code only (inside a <div>, no <html> or <body> tags).
    Style: Professional, with a header containing placeholders for Madrasa Name, Subject, Class, Time.
    Include: Multiple choice, Short answers, and Broad questions.
  `;

  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "<p>Error generating questions.</p>";
  } catch (error) {
    return "<p>Failed to connect to AI service. Please check API Key.</p>";
  }
};