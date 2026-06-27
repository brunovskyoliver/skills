#!/usr/bin/env node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const bundledSkillsRoot = path.join(packageRoot, "skills");

const args = process.argv.slice(2);

function has(flag) {
  return args.includes(flag);
}

function valuesAfter(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return [];

  const values = [];
  for (let i = index + 1; i < args.length; i += 1) {
    if (args[i].startsWith("-")) break;
    values.push(args[i]);
  }
  return values;
}

function usage() {
  console.log(`brunovskyoliver skill installer

Usage:
  npx brunovskyoliver@latest [options]

Options:
  --agent <agents...>   universal, codex, claude, or all
  --skill <skills...>   Skill names to install. Defaults to all.
  --force              Replace existing skill directories.
  --list               List bundled skills without installing.
  --dry-run            Show what would be installed.
  --help               Show this help.

Examples:
  npx brunovskyoliver@latest
  npx brunovskyoliver@latest --agent codex claude
  npx brunovskyoliver@latest --skill ralph to-prd to-issues --force
`);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findSkills(dir) {
  const found = [];

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });

    if (entries.some((entry) => entry.isFile() && entry.name === "SKILL.md")) {
      found.push({
        name: path.basename(current),
        source: current,
      });
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      await walk(path.join(current, entry.name));
    }
  }

  await walk(dir);
  return found.sort((a, b) => a.name.localeCompare(b.name));
}

function selectedTargets() {
  const home = os.homedir();
  const agents = valuesAfter("--agent");
  const requested = agents.length > 0 ? agents : ["universal", "codex", "claude"];
  const normalized = new Set(requested.map((agent) => agent.toLowerCase()));

  if (normalized.has("all")) {
    normalized.add("universal");
    normalized.add("codex");
    normalized.add("claude");
  }

  const targets = [];

  if (normalized.has("universal") || normalized.has("agents")) {
    targets.push({
      name: "universal",
      root: path.join(home, ".agents", "skills"),
    });
  }

  if (normalized.has("codex")) {
    targets.push({
      name: "codex",
      root: path.join(process.env.CODEX_HOME || path.join(home, ".codex"), "skills"),
    });
  }

  if (normalized.has("claude") || normalized.has("claude-code")) {
    targets.push({
      name: "claude",
      root: path.join(process.env.CLAUDE_CONFIG_DIR || path.join(home, ".claude"), "skills"),
    });
  }

  if (targets.length === 0) {
    throw new Error(`No supported agents selected: ${requested.join(", ")}`);
  }

  return targets;
}

async function main() {
  if (has("--help") || has("-h")) {
    usage();
    return;
  }

  const skills = await findSkills(bundledSkillsRoot);
  const requestedSkills = valuesAfter("--skill");
  const requestedSet = new Set(requestedSkills);
  const selectedSkills = requestedSkills.length === 0 || requestedSet.has("*")
    ? skills
    : skills.filter((skill) => requestedSet.has(skill.name));

  if (has("--list")) {
    for (const skill of skills) console.log(skill.name);
    return;
  }

  const missing = requestedSkills.filter((name) => name !== "*" && !skills.some((skill) => skill.name === name));
  if (missing.length > 0) {
    throw new Error(`Unknown skill(s): ${missing.join(", ")}`);
  }

  const targets = selectedTargets();
  const force = has("--force");
  const dryRun = has("--dry-run");
  let installed = 0;
  let skipped = 0;

  for (const target of targets) {
    await fs.mkdir(target.root, { recursive: true });

    for (const skill of selectedSkills) {
      const destination = path.join(target.root, skill.name);

      if (await exists(destination)) {
        if (!force) {
          console.log(`skip ${target.name}:${skill.name} already exists`);
          skipped += 1;
          continue;
        }

        if (!dryRun) await fs.rm(destination, { recursive: true, force: true });
      }

      if (dryRun) {
        console.log(`install ${target.name}:${skill.name} -> ${destination}`);
      } else {
        await fs.cp(skill.source, destination, { recursive: true });
        console.log(`installed ${target.name}:${skill.name} -> ${destination}`);
      }

      installed += 1;
    }
  }

  const action = dryRun ? "Would install" : "Installed";
  console.log(`${action} ${installed} skill target(s), skipped ${skipped}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

