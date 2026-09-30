@AGENTS.md

## Claude Code specifics

- The rules, budgets and working protocol are in `AGENTS.md` (imported above). Follow them exactly.
- MCP servers configured for this folder: `21st` (21st.dev catalog), `magicui` (Magic UI), `nano-banana` (Gemini `generate_image`, output → `images/generated/`). Check they're listed at the start of a session and log any that are missing as a blocker in `PROGRESS.md`.
- Use the built-in browser (`mcp__Claude_Browser__*`, `preview_start` via `.claude/launch.json`) to verify pages at 375px and desktop.
- Before context runs low, update `PROGRESS.md` (Handoff section) and commit, so the next session can continue cold.
