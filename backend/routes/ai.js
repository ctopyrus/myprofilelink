const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();

let aiClient = null;

function getAiClient() {
  if (!process.env.GOOGLE_AI_KEY) {
    const error = new Error('AI service is not configured.');
    error.statusCode = 503;
    throw error;
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY });
  }

  return aiClient;
}

function extractText(response) {
  if (!response) return '';
  if (typeof response.text === 'function') return response.text();
  if (typeof response.text === 'string') return response.text;
  return '';
}

router.post('/generate', async (req, res, next) => {
  try {
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required.' });
    }

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: process.env.GOOGLE_AI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.json({ success: true, result: extractText(response) });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
