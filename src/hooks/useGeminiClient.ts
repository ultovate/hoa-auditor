/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const MAX_RETRIES = 3;

/**
 * Calls the server-side Gemini proxy (see server.ts) — no API key ever
 * reaches the client. Retries with exponential backoff on failure.
 */
export const callGemini = async (
  prompt: string,
  systemInstruction = 'You are a forensic HOA document auditor.',
): Promise<string> => {
  const attempt = async (retries: number): Promise<string> => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction }),
      });

      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      return data.text || 'No response generated.';
    } catch (err) {
      if (retries < MAX_RETRIES) {
        const delay = Math.pow(2, retries + 1) * 500;
        await new Promise((r) => setTimeout(r, delay));
        return attempt(retries + 1);
      }
      throw err;
    }
  };
  return attempt(0);
};
