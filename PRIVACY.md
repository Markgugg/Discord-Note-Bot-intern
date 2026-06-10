# Privacy Policy

**Last updated: June 10, 2026**

## Overview

This Discord bot ("the Bot") is a private, internal tool used by a small team. It is not a public application and is not available for general use.

## Data We Collect

The Bot collects and stores the following data locally on the host machine:

- **Discord user IDs and usernames** — used to associate claims, standups, and action item reviews with the correct team member
- **Task claims** — the text of tasks you claim with `!claim`
- **Standup entries** — the text you submit with `!standup`
- **Call note summaries** — structured summaries generated from notes you submit, stored per channel
- **Action item review records** — which users reacted with ✅ on action item messages

## Data We Do NOT Collect

- Message content is **not** stored beyond what is needed to generate a summary in the moment
- No personal information beyond Discord username and user ID is collected
- No data is shared with third parties, sold, or used for advertising

## Third-Party Services

When you submit notes for summarization or use `!eod`, the text is sent to the **Anthropic Claude API** for processing. Anthropic's privacy policy applies to that data: [anthropic.com/privacy](https://www.anthropic.com/privacy)

## Data Storage

All data is stored in a local JSON file (`data/storage.json`) on the machine running the bot. No cloud database or external storage is used.

## Data Retention

Data is retained indefinitely in the local storage file unless manually deleted. Summaries are capped at 50 per channel internally.

## Contact

This bot is operated privately. If you have questions, contact the bot operator directly.
