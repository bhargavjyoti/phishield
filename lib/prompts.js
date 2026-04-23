/**
 * lib/prompts.js
 * Builds the Groq/Llama prompt from email content + user profile MCQ answers.
 */

// Human-readable mappings for each MCQ answer value
const PROFILE_LABELS = {
  q1: {
    label: 'Link-clicking behaviour on unknown sender emails',
    values: {
      never: 'Never clicks — always verifies first',
      rarely: 'Rarely clicks — only if it looks legitimate',
      sometimes: 'Sometimes clicks — if subject seems relevant',
      often: 'Often clicks — clicks most links',
    },
  },
  q2: {
    label: 'Sender domain verification before opening attachments',
    values: {
      always: 'Always verifies — part of routine',
      usually: "Usually verifies — unless in a hurry",
      rarely: 'Rarely verifies — trusts the display name',
      never: "Never verifies — didn't know they should",
    },
  },
  q3: {
    label: 'Primary email usage environment',
    values: {
      corporate: 'Corporate — work emails only',
      personal: 'Personal — non-work usage',
      both: 'Both — work and personal mixed',
      high_volume: 'High-volume — large organisation, many senders',
    },
  },
  q4: {
    label: 'History of interaction with phishing or scam emails',
    values: {
      never: 'Never interacted — always caught them',
      almost: 'Almost fell for one — realised before submitting data',
      once: 'Fell for one once — was a sophisticated attack',
      multiple: 'Fell for multiple — unsure how to spot them',
    },
  },
  q5: {
    label: 'Frequency of receiving emails requesting personal/financial info',
    values: {
      daily: 'Daily — very common in inbox',
      weekly: 'Weekly — a few times per week',
      monthly: 'Monthly — occasional',
      rarely: 'Rarely — almost never',
    },
  },
  q6: {
    label: 'Multi-Factor Authentication (MFA) usage',
    values: {
      all: 'Yes — on all critical accounts',
      some: 'Some — on a few important ones',
      planning: 'Not yet — planning to set it up',
      no: 'No — uses passwords only',
    },
  },
};

/**
 * Build a formatted string representation of the user's profile answers.
 * @param {object} profile - key/value MCQ answers e.g. { q1: 'never', q2: 'always', ... }
 * @returns {string}
 */
function buildProfileSection(profile) {
  const lines = Object.entries(PROFILE_LABELS).map(([key, meta]) => {
    const rawValue = profile?.[key];
    const humanValue = meta.values[rawValue] || 'Not answered';
    return `  - ${meta.label}: ${humanValue}`;
  });
  return lines.join('\n');
}

/**
 * Build the full Groq/Llama prompt.
 * @param {string} emailContent - The raw email or message text pasted by the user.
 * @param {object} userProfile  - The user's MCQ answers from UserProfileContext.
 * @returns {string}            - The complete prompt string to send to Groq.
 */
export function buildPhishingPrompt(emailContent, userProfile) {
  const hasProfile = userProfile && Object.values(userProfile).some((v) => v !== '');
  const profileSection = hasProfile
    ? `## User Behavioural Profile (MCQ Answers)\nThe user completed a self-assessment questionnaire. Use these answers to personalise the susceptibility analysis:\n${buildProfileSection(userProfile)}`
    : `## User Behavioural Profile\nThe user has not completed their behavioural profile. Perform a general susceptibility assessment based on the email content alone.`;

  return `You are PhiShield, an expert cybersecurity AI specialised in phishing threat analysis and human-factor vulnerability assessment. Your task is to analyse a potentially malicious email/message AND the behavioural profile of the user who received it.

${profileSection}

## Email / Message Content to Analyse
\`\`\`
${emailContent.trim()}
\`\`\`

## Your Task
Analyse BOTH the email content AND the user's behavioural profile together. Consider:
1. Phishing indicators in the message: urgency cues, social engineering tactics, credential harvesting patterns, suspicious links/domains, impersonation, grammar anomalies, etc.
2. The user's personal vulnerability based on their MCQ answers: how likely are they to fall for this specific type of attack given their habits?

Return your analysis strictly as a single raw JSON object. Do NOT include markdown formatting, code fences, backticks, explanations, or any text outside the JSON object. The JSON must conform exactly to this schema:

{
  "riskScore": <integer 0-100, where 0 = no risk and 100 = maximum risk>,
  "riskLevel": <"Low" | "Medium" | "High" | "Critical">,
  "messageRisk": <"Safe" | "Suspicious" | "Phishing">,
  "attackType": <string, 1-3 words categorizing the threat (e.g. "Credential Harvesting", "Advance-Fee Scam", "Spam", "Safe Communication")>,
  "confidence": <integer 0-100, your confidence in the messageRisk classification>,
  "userSusceptibility": <integer 0-100, how vulnerable THIS specific user is to THIS specific attack>,
  "behaviouralAnalysis": <string, 2-4 sentence paragraph explaining the threat AND why this particular user is or is not at risk>,
  "immediateActions": <array of exactly 5 strings, specific actions the user should take RIGHT NOW>,
  "thingsToStop": <array of exactly 3 strings, specific risky behaviours the user should stop immediately>,
  "explanation": <string, 1-2 sentence technical summary of the email threat classification for display in the UI>
}

Scoring guidelines:
- riskScore 0-25 → riskLevel "Low"
- riskScore 26-50 → riskLevel "Medium"
- riskScore 51-75 → riskLevel "High"
- riskScore 76-100 → riskLevel "Critical"
- messageRisk "Safe" → typically riskScore < 30
- messageRisk "Suspicious" → typically riskScore 30-65
- messageRisk "Phishing" → typically riskScore > 65

Output ONLY the raw JSON. No preamble, no explanation, no markdown.`;
}
