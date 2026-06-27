#!/bin/bash
set -eo pipefail

# Usage: afk.sh [max_iterations]
# Run from the project root. Omit max_iterations to run until no tasks remain.

MAX=${1:-999}

for ((i=1; i<=MAX; i++)); do
  echo "=== Ralph iteration $i ==="

  tmpfile=$(mktemp)
  trap "rm -f $tmpfile" EXIT

  issues=$(cat issues/*.md 2>/dev/null || echo "No issues found")
  commits=$(git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "No commits found")

  if [ -f ralph/prompt.md ]; then
    prompt=$(cat ralph/prompt.md)
  else
    prompt=$(cat ~/.codex/skills/ralph/references/default-prompt.md)
  fi

  codex exec \
    --sandbox workspace-write \
    -o "$tmpfile" \
    "Previous commits: $commits

Issues: $issues

$prompt"

  last_message=$(cat "$tmpfile" 2>/dev/null || echo "")

  if [[ "$last_message" == *"<promise>NO MORE TASKS</promise>"* ]]; then
    echo "Ralph complete after $i iteration(s)."
    exit 0
  fi
done

echo "Ralph finished $MAX iteration(s)."
