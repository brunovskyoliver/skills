# brunovskyoliver skills

Personal agent skill bundle installable with the `skills` CLI.

## Install

Preferred install through the `skills` CLI:

```bash
npx skills@latest add brunovskyoliver/skills --all -g --copy
```

Install only for Codex and Claude Code:

```bash
npx skills@latest add brunovskyoliver/skills -g --agent codex claude-code --skill '*' --copy -y
```

## Git-free install

If Git is not installed, use the npm package installer instead. This works on macOS,
Windows, and Linux with Node/npm only:

```bash
npx brunovskyoliver@latest
```

Install only for Codex and Claude Code:

```bash
npx brunovskyoliver@latest --agent codex claude
```

Replace existing installed skills:

```bash
npx brunovskyoliver@latest --force
```

## List available skills

```bash
npx skills@latest add brunovskyoliver/skills --list --full-depth
```

With the Git-free installer:

```bash
npx brunovskyoliver@latest --list
```
