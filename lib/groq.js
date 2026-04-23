/**
 * lib/groq.js
 * Thin wrapper around the Groq REST API using the Llama 3.3 70B model.
 * API key is read exclusively from server-side environment variables — never exposed to the browser.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Send a prompt to Groq's Llama 3.3 70B model and return the raw text response.
 * @param {string} prompt - The full prompt string to send.
 * @returns {Promise<string>} - The raw text content from Groq's first choice.
 * @throws {Error} If the API call fails or returns an unexpected structure.
 */
export async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error(
      'GROQ_API_KEY is not configured. Please add your real API key to .env.local.'
    );
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();

  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Groq returned an empty or unexpected response structure.');
  }

  return text;
}
