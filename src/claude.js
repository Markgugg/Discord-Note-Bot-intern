const Anthropic = require('@anthropic-ai/sdk');
const { CLAUDE_MODEL } = require('../config');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SUMMARIZE_SYSTEM = `You are a professional meeting notes processor. Given raw, messy call/meeting notes, extract and structure them into clean JSON.

Return ONLY valid JSON with exactly these fields:
{
  "summary": "2-3 sentence overview of the call",
  "participants": "who was involved and what project/company context",
  "keyPoints": ["bullet point 1", "bullet point 2", ...],
  "actionItems": ["task description (owner: Name or owner unknown)", ...],
  "blockers": ["blocker or issue 1", ...],
  "decisions": ["decision 1", ...],
  "nextSteps": ["next step 1", ...]
}

Rules:
- If no names are mentioned for action items, write "owner unknown"
- If a section has nothing, use an empty array [] or empty string ""
- keyPoints, actionItems, blockers, decisions, nextSteps must be arrays
- summary and participants must be strings
- Do not include any text outside the JSON object`;

const OVERLAP_SYSTEM = `You are a task coordinator for a team of interns working on UI tasks.
Determine if a newly claimed task overlaps with or duplicates any existing claimed task.

Return ONLY valid JSON:
{
  "hasOverlap": true or false,
  "overlappingIndex": index of the overlapping task in the existing list (or -1),
  "reason": "brief explanation of why they overlap or don't"
}`;

function stripCodeFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
}

async function summarizeNotes(notes) {
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: SUMMARIZE_SYSTEM,
    messages: [{ role: 'user', content: `Notes to summarize:\n\n${notes}` }],
  });
  const raw = stripCodeFences(response.content[0].text);
  return JSON.parse(raw);
}

async function detectTaskOverlap(newClaim, existingClaims) {
  if (!existingClaims || existingClaims.length === 0) {
    return { hasOverlap: false, overlappingIndex: -1, reason: 'No existing claims' };
  }

  const existingList = existingClaims
    .map((c, i) => `${i}. ${c.username}: "${c.task}"`)
    .join('\n');

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 256,
    system: OVERLAP_SYSTEM,
    messages: [
      {
        role: 'user',
        content: `New task being claimed: "${newClaim}"\n\nExisting claimed tasks:\n${existingList}`,
      },
    ],
  });
  const raw = stripCodeFences(response.content[0].text);
  return JSON.parse(raw);
}

module.exports = { summarizeNotes, detectTaskOverlap };
