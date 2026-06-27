# Issue tracker: Local Markdown

Issues and PRDs for this repo live as markdown files in the repository.

## Conventions

- Planning artifacts live under `.scratch/<feature-slug>/`
- PRDs may live at `.scratch/<feature-slug>/PRD.md`
- AFK-ready implementation issues live in `issues/<NN>-<slug>.md`, numbered globally from `001`
- Completed implementation issues move to `issues/done/`
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading
- If `ralph/prompt.md` names a different runnable queue, use that queue for AFK-ready implementation issues instead

## When a skill says "publish to the issue tracker"

Create a new implementation issue under `issues/` (creating the directory if needed) when the issue is ready for an AFK agent. Use `.scratch/<feature-slug>/` for PRDs, drafts, prototypes, and planning artifacts.

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.
