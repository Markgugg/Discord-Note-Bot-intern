# Discord Note Bot

A Discord bot that transforms messy call/meeting notes into clean structured summaries, plus intern team coordination tools.

## Features

- **Notes Processor** — paste raw notes, get a formatted summary with action items, participants, decisions, and more
- **Multi-message sessions** — collect notes across multiple messages before summarizing
- **Smart output** — short summaries as Discord embeds, long ones as `.md` file attachments
- **Action item tracking** — follow-up checklist with ✅ reaction support
- **Summary history** — `/history` to pull last 5 summaries per channel
- **Team coordination** — `!claim`, `!standup`, `!teamstatus`, duplicate-task detection via Claude

---

## Setup

### 1. Discord Developer Portal

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications) and click **New Application**
2. Name it, then go to the **Bot** tab → **Add Bot**
3. Copy the **Token** — this is your `DISCORD_TOKEN`
4. Under **Privileged Gateway Intents**, enable:
   - ✅ **Message Content Intent**
5. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Read Message History`, `Add Reactions`, `Attach Files`, `Embed Links`, `Read Messages/View Channels`
6. Open the generated URL to invite the bot to your server
7. Copy your **Application ID** from the General Information tab — this is your `CLIENT_ID`
8. To get your `GUILD_ID`: in Discord, enable Developer Mode (Settings → Advanced), right-click your server → **Copy Server ID**

### 2. Anthropic API Key

Get your API key from [console.anthropic.com](https://console.anthropic.com).

### 3. Install & Configure

```bash
cd Notes-DBot
npm install
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DISCORD_TOKEN=your_token
ANTHROPIC_API_KEY=your_key
CLIENT_ID=your_app_id
GUILD_ID=your_server_id   # optional but recommended for dev
NOTES_CHANNEL=notes        # optional: channel name to restrict the bot to
```

### 4. Register Slash Commands

```bash
npm run deploy
```

With `GUILD_ID` set this is instant. Without it, global registration takes up to 1 hour.

### 5. Run the Bot

```bash
# Production
npm start

# Development (auto-restarts on file changes)
npm run dev
```

---

## Commands

### Notes Commands

| Command | Description |
|---|---|
| `!summarize [notes]` | Summarize notes inline, or prompt for the next message |
| `!start` | Begin a multi-message session |
| `!done` | End session and summarize collected notes |
| `!cancel` | Discard the active session |
| `!history` / `/history` | Show last 5 summaries in this channel |
| `!help` | Show all commands |

### Summary Output Sections

- **Call Summary** — 2-3 sentence overview
- **Participants / Context** — who was involved
- **Key Discussion Points** — bullet list of main topics
- **Action Items** — numbered checklist with owners (`owner unknown` if not mentioned)
- **Blockers / Issues** — risks and dependencies
- **Decisions Made** — any agreements reached
- **Next Steps / Follow-up** — deadlines, next meetings

### Team Coordination Commands

| Command | Description |
|---|---|
| `!claim <task>` | Claim a task you're working on |
| `!unclaim` | Release your current claim |
| `!teamstatus` | See what everyone is working on |
| `!standup yesterday \| today \| blockers` | Post your daily standup |
| `!who <keyword>` | Search who's working on something |
| `!pass @user <task>` | Hand off a task; sends them a DM |

### Action Item Reactions

After a summary, the bot posts a **Action Items Checklist** message. React with ✅ to mark it as reviewed. The embed footer updates to show who has reviewed it.

---

## Configuration

All config lives in `.env`. Key options:

| Variable | Default | Description |
|---|---|---|
| `NOTES_CHANNEL` | _(any)_ | Restrict notes commands to this channel name |
| `PREFIX` | `!` | Command prefix |
| `CLAUDE_MODEL` | `claude-sonnet-4-6` | Anthropic model to use |
| `OUTPUT_FORMAT` | `auto` | `auto`, `embed`, or `file` |

---

## Project Structure

```
Notes-DBot/
├── index.js               # Entry point
├── config.js              # Configuration constants
├── deploy-commands.js     # Slash command registration
├── data/
│   └── storage.json       # Persistent data (auto-created, gitignored)
└── src/
    ├── claude.js          # Anthropic API calls
    ├── storage.js         # JSON file persistence
    ├── formatter.js       # Discord embeds + markdown builder
    ├── sessions.js        # In-memory multi-message sessions
    ├── handlers/
    │   ├── message.js     # messageCreate event handler
    │   └── reaction.js    # messageReactionAdd event handler
    └── commands/
        ├── router.js      # Command parser and dispatcher
        ├── summarize.js   # !summarize logic
        ├── session.js     # !start / !done / !cancel
        ├── history.js     # !history / /history
        ├── help.js        # !help
        └── coordination.js # !claim / !standup / etc.
```
