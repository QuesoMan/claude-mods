# claude-mods

Mods for Claude Code.

| Mod | What it does |
|---|---|
| [agent-tree](agent-tree) | Live pane showing the subagent spawn tree as cards: who spawned whom, model, status, task, cost, elapsed time and recent tools. Flags Fable running as a worker and subagents idle for 2 minutes. `/agent-tree` toggles the pane. |

## Install

At the prompt of a terminal session:

```
/plugin install agent-tree --marketplace jz-wilson/claude-mods
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install agent-tree --marketplace jz-wilson/claude-mods
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `jz-wilson/claude-mods`, then Add plugin.

## agent-tree and claude-hud

If [claude-hud](https://github.com/jarrodwatts/claude-hud) is installed, agent-tree turns off its `display.showAgents` while the Agents pane is on screen and restores the earlier value when the pane closes or the session ends.

## Development

Each mod is a folder with `.claude-plugin/plugin.json`. CI runs `claude plugin validate` and `claude plugin test` on every mod for each push and pull request. A merge to `main` that bumps a mod's `version` publishes a GitHub release tagged `<mod>-v<version>`.

```
claude plugin validate agent-tree
claude plugin test agent-tree
```
