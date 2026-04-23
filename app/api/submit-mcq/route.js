/**
 * app/api/submit-mcq/route.js
 * POST /api/submit-mcq
 *
 * Accepts: { emailContent: string, userProfile: object }
 * Returns: Parsed Groq/Llama analysis as clean JSON.
 * Error codes surfaced to client: 400, 429, 502, 503, 504, 500
 */

import { NextResponse } from 'next/server';
import { callGroq } from '../../../lib/groq';
import { buildPhishingPrompt } from '../../../lib/prompts';
import { parseGroqResponse } from '../../../lib/scoring';

// 30-second timeout wrapper
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms)
    ),
  ]);
}

export async function POST(request) {
  try {
    // 1. Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const { emailContent, userProfile } = body;

    // 2. Validate required input
    if (!emailContent || typeof emailContent !== 'string' || !emailContent.trim()) {
      return NextResponse.json(
        { error: 'emailContent is required and must be a non-empty string.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    if (emailContent.trim().length < 10) {
      return NextResponse.json(
        { error: 'emailContent is too short for meaningful analysis.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    // 3. Build prompt
    const prompt = buildPhishingPrompt(emailContent, userProfile ?? {});

    // 4. Call Groq with 30-second timeout
    let rawResponse;
    try {
      rawResponse = await withTimeout(callGroq(prompt), 30000);
    } catch (err) {
      if (err.message === 'TIMEOUT') {
        return NextResponse.json(
          { error: 'Analysis is taking too long. Please try again.', code: 'TIMEOUT' },
          { status: 504 }
        );
      }
      throw err; // re-throw for outer catch
    }

    // 5. Parse and validate the response
    const result = parseGroqResponse(rawResponse);

    // 6. Return clean JSON to the frontend
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('[/api/submit-mcq] Error:', error.message);

    // API key not configured
    if (error.message.includes('GROQ_API_KEY')) {
      return NextResponse.json(
        { error: 'Server configuration error: Groq API key is not set.', code: 'CONFIG_ERROR' },
        { status: 503 }
      );
    }

    // Rate limit
    if (error.message.includes('429')) {
      return NextResponse.json(
        { error: 'Our AI is currently overloaded. Please wait a few minutes and try again.', code: 'RATE_LIMIT' },
        { status: 429 }
      );
    }

    // Groq upstream error
    if (error.message.includes('Groq API error')) {
      return NextResponse.json(
        { error: 'Analysis service is temporarily unavailable. Please try again later.', code: 'UPSTREAM_ERROR' },
        { status: 502 }
      );
    }

    // Malformed / non-JSON response from AI
    if (error.message.includes('could not be parsed') || error.message.includes('JSON')) {
      return NextResponse.json(
        { error: 'We received an unexpected response from the AI. Please try again.', code: 'PARSE_ERROR' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error during analysis.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
