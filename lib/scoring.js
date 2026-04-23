/**
 * lib/scoring.js
 * Parses and validates the raw JSON text returned by Groq/Llama.
 * Provides safe fallbacks for every field so the UI never crashes on missing data.
 */

/**
 * Parse the raw Groq/Llama response text into a validated result object.
 * The model is instructed to return raw JSON, but this function defensively
 * strips any accidental markdown fences before parsing.
 *
 * @param {string} rawText - Raw string returned from Groq.
 * @returns {object} - Validated, normalised result object safe for the frontend.
 */
export function parseGroqResponse(rawText) {
  // Strip markdown code fences if the model accidentally includes them
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    // If parsing fails entirely, return a safe error state
    return buildFallback(
      `AI response could not be parsed. Raw output: ${rawText.slice(0, 200)}`
    );
  }

  // Normalise and validate each field with sane defaults
  const rawScore = parseInt(parsed.riskScore, 10);
  const riskScore = isNaN(rawScore) ? null : clamp(rawScore, 0, 100);

  const rawSusc = parseInt(parsed.userSusceptibility, 10);
  const userSusceptibility = isNaN(rawSusc) ? null : clamp(rawSusc, 0, 100);

  const confidence = clamp(parseInt(parsed.confidence ?? 70, 10), 0, 100);

  const riskLevel = validateEnum(
    parsed.riskLevel,
    ['Low', 'Medium', 'High', 'Critical'],
    riskScore !== null ? deriveRiskLevel(riskScore) : 'Unknown'
  );

  const messageRisk = validateEnum(
    parsed.messageRisk,
    ['Safe', 'Suspicious', 'Phishing'],
    riskScore !== null ? deriveMessageRisk(riskScore) : 'Unknown'
  );

  const attackType =
    typeof parsed.attackType === 'string' && parsed.attackType.trim()
      ? parsed.attackType
      : (messageRisk === 'Safe' ? 'Legitimate' : 'Uncategorized Threat');

  const userRiskCategory =
    userSusceptibility !== null ? deriveRiskLevel(userSusceptibility) : 'Unknown';

  const behaviouralAnalysis =
    typeof parsed.behaviouralAnalysis === 'string' && parsed.behaviouralAnalysis.trim()
      ? parsed.behaviouralAnalysis
      : 'Behavioural analysis unavailable for this scan.';

  const explanation =
    typeof parsed.explanation === 'string' && parsed.explanation.trim()
      ? parsed.explanation
      : behaviouralAnalysis;

  // immediateActions — fallback if empty or missing
  let immediateActions = Array.isArray(parsed.immediateActions)
    ? parsed.immediateActions.filter(Boolean).slice(0, 5).map(String)
    : [];
  if (immediateActions.length === 0) {
    immediateActions = ['No specific actions identified. Exercise general caution with this message.'];
  }

  // thingsToStop — fallback if empty or missing
  let thingsToStop = Array.isArray(parsed.thingsToStop)
    ? parsed.thingsToStop.filter(Boolean).slice(0, 3).map(String)
    : [];
  if (thingsToStop.length === 0) {
    thingsToStop = ['No specific risky behaviours identified for this scan.'];
  }

  return {
    riskScore,                          // null if unparseable → UI shows "Score unavailable"
    riskLevel,
    messageRisk,
    attackType,
    confidence,
    userSusceptibility,                 // null if unparseable
    userRiskCategory,
    behaviouralAnalysis,
    explanation,
    immediateActions,
    thingsToStop,
    advice: immediateActions,           // legacy alias
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(value, min, max) {
  return Math.min(Math.max(isNaN(value) ? (min + max) / 2 : value, min), max);
}

function validateEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function deriveRiskLevel(score) {
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Medium';
  if (score <= 75) return 'High';
  return 'Critical';
}

function deriveMessageRisk(score) {
  if (score < 30) return 'Safe';
  if (score < 66) return 'Suspicious';
  return 'Phishing';
}

function buildFallback(reason) {
  return {
    riskScore: null,
    riskLevel: 'Unknown',
    messageRisk: 'Unknown',
    attackType: 'Unknown',
    confidence: null,
    userSusceptibility: null,
    userRiskCategory: 'Unknown',
    behaviouralAnalysis: reason,
    explanation: reason,
    immediateActions: ['Unable to parse AI response. Please try the scan again.'],
    thingsToStop: ['Do not act on this message until analysis is confirmed.'],
    advice: ['Unable to parse AI response. Please try the scan again.'],
  };
}
