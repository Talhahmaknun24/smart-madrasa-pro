import { GoogleGenAI, Chat } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a polite, knowledgeable Islamic Assistant for "Smart Madrasa Pro".
Your goal is to assist in Bengali or English.
Always begin with "Bismillah" or an Islamic greeting when appropriate.
If asked for religious rulings (Fatwa), politely advise consulting a Mufti, but provide general references from Quran and Sunnah.
`;

export const startChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
};

export const generateNotice = async (topic: string, language: 'en' | 'bn'): Promise<string> => {
  const prompt = `
    Draft a formal Madrasa notice in ${language === 'bn' ? 'Bengali' : 'English'}.
    Topic: ${topic}
    Format: HTML (inside a <div>), professional styling.
    Include placeholders for Date and Signature.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Failed to generate notice.";
  } catch (e) {
    return "Error connecting to AI.";
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
    const response = await ai.models.generateContent({
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "<p>Error generating questions.</p>";
  } catch (error) {
    return "<p>Failed to connect to AI service.</p>";
  }
};
