/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is required (set it in .env)');
}

const ai = new GoogleGenAI({ apiKey });
const app = express();
app.use(express.json());

app.post('/api/gemini', async (req, res) => {
  const { prompt, systemInstruction } = req.body ?? {};
  if (typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'prompt is required' });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: typeof systemInstruction === 'string' ? { systemInstruction } : undefined,
    });
    res.json({ text: response.text ?? '' });
  } catch (err) {
    console.error('Gemini request failed:', err);
    res.status(502).json({ error: 'Gemini request failed' });
  }
});

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => {
  console.log(`Gemini proxy listening on http://localhost:${port}`);
});
