---
description: Put the cache bar under your status line (keeps claude-hud or whatever runs there now)
allowed-tools: Bash, Read, Edit, Write
---

Install cache-bar as the status line, wrapping the current one. Work through these steps in order and report what you changed.

## 1. Locate the files

- Settings: `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/settings.json`
- cache-bar config: `${CLAUDE_CONFIG_DIR:-$HOME/.claude}/plugins/cache-bar/config.json`

Confirm the plugin is installed and `bun` is on PATH:

```bash
ls -1d "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plugins/cache/*/cache-bar/*/ 2>/dev/null | sort -V | tail -1
bun --version
```

If either prints nothing, stop and tell the user what is missing.

## 2. Back up settings.json

Keep an existing backup: it holds the settings from before the first setup.

```bash
dir="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
[ -e "$dir/settings.json.bak-cache-bar" ] || cp "$dir/settings.json" "$dir/settings.json.bak-cache-bar"
```

## 3. Move the current status line into `inner`

Read `settings.json`. If `statusLine.command` is set and does not already contain `cache-bar`, write it verbatim as `inner` in the cache-bar config, keeping any `handoffMinutes` or `floorTokens` already there. Create the folder if needed. Example result:

```json
{ "inner": "<the previous statusLine.command, unchanged>", "handoffMinutes": 5, "floorTokens": 80000 }
```

If `statusLine.command` already contains `cache-bar`, leave `inner` alone; setup has already run.

## 4. Point the status line at cache-bar

Edit `settings.json` so `statusLine` has these values, keeping any other keys already under it (such as `padding`):

```json
"statusLine": {
  "type": "command",
  "command": "plugin_dir=$(ls -1d \"${CLAUDE_CONFIG_DIR:-$HOME/.claude}\"/plugins/cache/*/cache-bar/*/ 2>/dev/null | sort -V | tail -1); exec bun \"${plugin_dir}bin/statusline.ts\"",
  "refreshInterval": 60
}
```

The `ls … | sort -V | tail -1` picks the newest installed version, so the path survives plugin updates. `refreshInterval: 60` repaints the countdown while the session is idle.

## 5. Check it

```bash
plugin_dir=$(ls -1d "${CLAUDE_CONFIG_DIR:-$HOME/.claude}"/plugins/cache/*/cache-bar/*/ | sort -V | tail -1)
echo '{"prompt_cache":{"warm":true,"ttl":"1h","expires_at":'$(( $(date +%s) + 1380 ))'},"context_window":{"total_input_tokens":182000}}' | bun "${plugin_dir}bin/statusline.ts"
```

The output should show the previous status line, then a line like `cache ▰▰▰▱▱▱▱▱ 23m 182k · handoff in 18m`. The bar shows up in the session after the next request.

## Undo

Restore the backup: `cp settings.json.bak-cache-bar settings.json` in the same folder, or set `statusLine.command` back to the `inner` value from the cache-bar config.
