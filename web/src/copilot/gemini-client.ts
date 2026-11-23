import { GroundedClaim, GroundedAnswer, verifyClaims } from './verifier';
import { JudgmentDocument } from '../types/schema';
import { KeyManager } from './key-manager';

const GEMINI_MODEL = 'gemini-2.0-flash';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function askGeminiGrounded(
  question: string,
  doc: JudgmentDocument
): Promise<GroundedAnswer> {
  const apiKey = KeyManager.getKey();
  if (!apiKey) {
    throw new Error('No Gemini API Key provided. Please enter your API key in BYOK Settings or use Demo Mode.');
  }

  // Build context from document paragraphs
  const paraContext = doc.paragraphs
    .slice(0, 40) // Limit to first 40 paragraphs to conserve context and ensure precision
    .map(p => `[Paragraph ${p.index} | Section: ${p.section_tag}]\n${p.text}`)
    .join('\n\n');

  const systemInstruction = `You are a certified judicial analyst assisting an advocate.
Your task is to answer the user's question about this Indian High Court judgment based STRICTLY AND ONLY on the provided paragraphs.

CRITICAL GROUNDING RULES:
1. Every claim you make must be accompanied by the exact paragraph index (paraIndex) and a verbatim excerpt (verbatimQuote) from that paragraph.
2. The verbatimQuote MUST match the paragraph text word-for-word. Do not summarize or paraphrase inside verbatimQuote.
3. If the answer cannot be found in the paragraphs, output an empty claims array.
4. Output strictly valid JSON with this exact schema:
{
  "summary": "Brief direct answer to the question",
  "claims": [
    {
      "claimText": "Concise statement of fact or legal ratio",
      "paraIndex": 1,
      "verbatimQuote": "Exact quote from paragraph 1"
    }
  ]
}`;

  const prompt = `Judgment: ${doc.court_name} — ${doc.case_number} (${doc.parties.petitioner} v. ${doc.parties.respondent})

Text:
${paraContext}

Advocate Question:
${question}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1
    }
  };

  const url = `${API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Gemini API call failed with status ${response.status}`
    );
  }

  const result = await response.json();
  const textContent = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('Empty response from Gemini API.');
  }

  let parsed: { summary?: string; claims?: GroundedClaim[] };
  try {
    parsed = JSON.parse(textContent);
  } catch (err) {
    throw new Error('Failed to parse structured JSON from model response.');
  }

  const rawClaims: GroundedClaim[] = (parsed.claims || []).map(c => ({
    claimText: c.claimText,
    jid: doc.jid,
    paraIndex: Number(c.paraIndex),
    verbatimQuote: c.verbatimQuote
  }));

  // Client-side verification: drops any hallucinated claim or mismatched quote
  const verified = verifyClaims(rawClaims, doc);
  if (parsed.summary && !verified.insufficientEvidence) {
    verified.summary = parsed.summary;
  }
  return verified;
}
