---
name: project_bragger
description: Bragger - Telegram bot for daily work logging, weekly/monthly brag document generation using Claude API
type: project
---

Telegram bot that captures daily work accomplishments and generates brag documents.

**Core flow:**
- Daily structured prompts at 18:00 (São Paulo time) with reminder at 18:30 if no response
- Supports ad-hoc logging anytime during the day
- Claude API generates polished daily summaries
- Weekly rollup on Friday EOD from daily summaries
- Monthly rollup at beginning of each month from weekly docs (Julia Evans-style categories)
- Monthly sections in yearly doc are append-only (new months may reference but not edit past months)

**Tech stack:**
- TypeScript / Node.js
- SQLite (better-sqlite3 or drizzle-orm) for storage
- Markdown export for documents
- Telegram bot (telegraf or grammy)
- Claude API (@anthropic-ai/sdk)
- node-cron for scheduling

**Template:** Hybrid — chronological daily/weekly, Julia Evans categories for monthly rollups (Projects & Impact, Challenges & Growth, Technologies & Skills, Collaboration)

**Single user, homelab deployment.**
