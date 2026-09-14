# Git collaboration workflow

This repository uses a simple feature-branch workflow for a three-person team.

## Protected branch

`main` must always contain reviewed, runnable code. Do not develop directly on
`main` after the initial repository setup.

## Starting work

Update your local `main`, then create a short-lived branch:

```bash
git switch main
git pull --ff-only
git switch -c feature/short-description
```

Use these branch prefixes:

- `feature/` for new functionality
- `fix/` for bug fixes
- `docs/` for documentation only
- `chore/` for tooling or maintenance

Use lowercase words separated by hyphens, for example
`feature/university-details`.

## Commits

Make small commits that contain one logical change. Use an imperative message
with one of these prefixes:

```text
feat: add university details endpoint
fix: validate empty search query
docs: explain local startup
chore: update development tooling
test: cover popular university cache
refactor: map university entity to DTO
```

Never commit `.env`, `.env.local`, passwords, tokens, generated build output,
or dependency directories.

## Pull requests

Push the branch and open a pull request into `main`:

```bash
git push -u origin feature/short-description
```

Before merging:

1. Complete the pull request template.
2. Make sure backend tests and frontend lint pass.
3. Ask at least one teammate to review.
4. Resolve review comments and merge conflicts.
5. Use **Squash and merge** so `main` stays easy to read.
6. Delete the merged remote branch.

Avoid force-pushing shared branches. Never use `git push --force` on `main`.

## Daily synchronization

Before starting new work, update local `main`:

```bash
git switch main
git pull --ff-only
```

If two developers need the same files, agree on ownership before coding or
split the work into separate files to reduce conflicts.
