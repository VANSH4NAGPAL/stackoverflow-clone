import { GoogleGenAI } from "@google/genai";

export const askAI = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Mock response if API key is not set
      return res.status(200).json({
        data: "This is a mock AI response because the GEMINI_API_KEY environment variable is not set. Please add your key to the backend .env file.",
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return res.status(200).json({ data: response.text });
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ message: "Failed to generate AI response" });
  }
};
