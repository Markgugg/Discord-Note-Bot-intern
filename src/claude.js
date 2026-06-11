const Anthropic = require('@anthropic-ai/sdk');
const { CLAUDE_MODEL } = require('../config');
const fs = require('fs');
const path = require('path');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function loadContext() {
  try {
    const raw = fs.readFileSync(path.resolve('./context.md'), 'utf8');
    // Strip the template comments and blank sections
    return raw.replace(/<!--.*?-->/gs, '').trim();
  } catch {
    return '';
  }
}

function stripCodeFences(text) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
}

function buildSystemPrompt(base) {
  const ctx = loadContext();
  if (!ctx) return base;
  return `${base}\n\n## Team & Project Context\n${ctx}`;
}

const SUMMARIZE_SYSTEM = buildSystemPrompt(`You are a meeting notes processor for a software team.
Given raw call or meeting notes, extract and structure them into clean JSON.

Return ONLY valid JSON with exactly these fields:
{
  "summary": "2-3 sentence overview",
  "participants": "who was involved and what project/context",
  "keyPoints": ["point 1", "point 2"],
  "actionItems": ["plain task description only — no owner names, no parentheses", ...],
  "blockers": ["blocker 1", ...],
  "decisions": ["decision 1", ...],
  "nextSteps": ["next step 1", ...]
}

Rules:
- actionItems must be clean task descriptions only — no owner names appended
- All tasks go into an unclaimed pool; ownership is assigned separately
- If a section has nothing, use [] or ""
- keyPoints, actionItems, blockers, decisions, nextSteps must be arrays
- summary and participants must be strings
- No text outside the JSON object`);

const OVERLAP_SYSTEM = buildSystemPrompt(`You are a task coordinator for a small intern team working on UI tasks.
Determine if a newly claimed task overlaps with or duplicates an existing claimed task.

Return ONLY valid JSON:
{
  "hasOverlap": true or false,
  "overlappingIndex": index in the existing list (or -1),
  "reason": "one sentence explanation"
}`);

const RECAP_SYSTEM = buildSystemPrompt(`You write end-of-day updates for a software intern.
Write a short, plain update — 3-5 lines. No em dashes. No emojis. No bold or markdown.
No "I'm pleased to report" or any corporate filler. Write like a real person.

Format:
Done: [what was finished]
Working on: [what's in progress]
Blockers: [any blockers, or "none"]

Keep it under 6 lines total. If there's nothing to report for a section, write "none".`);

async function summarizeNotes(notes) {
  // Rebuild with fresh context each call so edits to context.md take effect
  const system = buildSystemPrompt(`You are a meeting notes processor for a software team.
Given raw call or meeting notes, extract and structure them into clean JSON.

Return ONLY valid JSON with exactly these fields:
{
  "summary": "2-3 sentence overview",
  "participants": "who was involved and what project/context",
  "keyPoints": ["point 1", "point 2"],
  "actionItems": ["plain task description only — no owner names, no parentheses", ...],
  "blockers": ["blocker 1", ...],
  "decisions": ["decision 1", ...],
  "nextSteps": ["next step 1", ...]
}

Rules:
- actionItems must be clean task descriptions only — no owner names appended
- All tasks go into an unclaimed pool; ownership is assigned separately
- If a section has nothing, use [] or ""
- keyPoints, actionItems, blockers, decisions, nextSteps must be arrays
- summary and participants must be strings
- No text outside the JSON object`);

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system,
    messages: [{ role: 'user', content: `Notes:\n\n${notes}` }],
  });
  const raw = stripCodeFences(response.content[0].text);
  return JSON.parse(raw);
}

async function detectTaskOverlap(newClaim, existingClaims) {
  if (!existingClaims || existingClaims.length === 0) {
    return { hasOverlap: false, overlappingIndex: -1, reason: 'No existing claims' };
  }

  const system = buildSystemPrompt(`You are a task coordinator for a small intern team working on UI tasks.
Determine if a newly claimed task overlaps with or duplicates an existing claimed task.

Return ONLY valid JSON:
{
  "hasOverlap": true or false,
  "overlappingIndex": index in the existing list (or -1),
  "reason": "one sentence explanation"
}`);

  const existingList = existingClaims
    .map((c, i) => `${i}. ${c.claimedUsername}: "${c.description}"`)
    .join('\n');

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 256,
    system,
    messages: [
      {
        role: 'user',
        content: `New task: "${newClaim}"\n\nExisting tasks:\n${existingList}`,
      },
    ],
  });
  const raw = stripCodeFences(response.content[0].text);
  return JSON.parse(raw);
}

async function generateRecap(userId, username, completedTasks, ongoingTask, extraNotes) {
  const system = buildSystemPrompt(`You write end-of-day updates for a software intern.
Write a short, plain update. No em dashes. No emojis. No bold or markdown formatting.
No corporate filler phrases. Write like a real person texting their team.

Format exactly like this (no extra lines):
Done: [comma separated list of what was finished, or "nothing"]
Working on: [current task, or "nothing"]
Blockers: [blockers, or "none"]

Max 3 lines total.`);

  const parts = [];
  if (completedTasks.length) parts.push(`Completed tasks: ${completedTasks.join(', ')}`);
  if (ongoingTask) parts.push(`Current task: ${ongoingTask}`);
  if (extraNotes) parts.push(`Notes: ${extraNotes}`);

  if (!parts.length) {
    return `Done: nothing\nWorking on: nothing\nBlockers: none`;
  }

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 200,
    system,
    messages: [
      {
        role: 'user',
        content: `Team member: ${username}\nDate: ${new Date().toLocaleDateString()}\n\n${parts.join('\n')}`,
      },
    ],
  });
  return response.content[0].text.trim();
}

async function analyzeScreenshot(imageUrl, username) {
  const system = buildSystemPrompt(`You analyze screenshots from a software intern's screen.
Describe what they are working on in 1-2 plain sentences.
Then suggest a short task description they could use to claim this work (under 10 words).

Return ONLY valid JSON:
{
  "description": "what they appear to be working on",
  "suggestedClaim": "short task description"
}`);

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 256,
    system,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'url', url: imageUrl },
          },
          {
            type: 'text',
            text: `This screenshot is from ${username}. What are they working on?`,
          },
        ],
      },
    ],
  });
  const raw = stripCodeFences(response.content[0].text);
  return JSON.parse(raw);
}

module.exports = { summarizeNotes, detectTaskOverlap, generateRecap, analyzeScreenshot };
