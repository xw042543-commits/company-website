# Production CD Design

## Goal

Deploy the exact `main` commit to the production host only after the existing `CI` workflow has completed successfully and an authorized operator has explicitly started the manual production workflow.

The deployment must preserve `.env.production`, PostgreSQL, Redis, Elasticsearch, and Caddy volumes. It must fail closed when the release commit, SSH host identity, repository state, deployment configuration, container health, or public smoke checks are invalid.

## Trigger and approval boundary

A separate `.github/workflows/deploy-production.yml` workflow runs only through `workflow_dispatch` for an explicitly requested deployment of the current `main` commit. This repository is private and its current GitHub plan does not provide Environment required reviewers, so the deliberate **Run workflow** action is the approval boundary; there is no automatic `workflow_run`, `push`, or scheduled deployment trigger.

The deployment job is restricted to `main` and targets the GitHub Environment named `production`, whose deployment branch policy must also allow only `main`. Before exposing the SSH step, the job queries GitHub Actions and requires a successful `CI` push run whose `head_sha` exactly matches the release SHA.

Production deployments use a non-cancelling concurrency group so a newer merge cannot interrupt an in-progress `docker compose up` operation. A later deployment waits for the current deployment to finish.

## Release identity

The release SHA is the manually dispatched workflow commit SHA on `main`.

The remote script fetches `origin/main`, verifies that `origin/main` equals the requested release SHA, requires a clean tracked working tree, checks out `main`, and advances it with a fast-forward-only merge. It never uses `git reset --hard`, force checkout, or a moving release selected independently by the workflow.

## SSH trust and secrets

The workflow uses the OpenSSH client already available on the GitHub-hosted runner. It does not use password authentication, disable host-key checking, or depend on an unpinned third-party SSH action.

The `production` Environment must define these secrets:

- `PRODUCTION_SSH_HOST`: server IP address or resolvable hostname.
- `PRODUCTION_SSH_PORT`: SSH port, normally `22`.
- `PRODUCTION_SSH_USER`: restricted deployment user. It must be able to access `/opt/company-website` and run the required Docker commands.
- `PRODUCTION_SSH_PRIVATE_KEY`: private key dedicated to GitHub Actions deployment.
- `PRODUCTION_SSH_KNOWN_HOSTS`: verified `known_hosts` line obtained from the server/provider and checked out-of-band.

The application secrets remain only in `/opt/company-website/.env.production` on the server. They are not copied into GitHub Actions and are never printed.

## Remote deployment sequence

After approval, the workflow checks out the exact release SHA and streams that revision's repository-owned deployment script to the host with the release SHA. This avoids relying on an older or missing copy of the script in the pre-deployment server checkout. The streamed script then:

1. Enter `/opt/company-website` and verify `.env.production` exists.
2. Reject tracked working-tree changes.
3. Fetch `origin/main`, verify the requested SHA is the current remote `main`, and fast-forward the server checkout.
4. Run `scripts/deployment-preflight.mjs` in the pinned Node 24 container.
5. Validate `compose.production.yaml` with the existing environment file.
6. Build the `backend` and `frontend` images with `--pull`.
7. Start/update the production topology with `--wait --wait-timeout 300`.
8. Verify backend readiness inside the private backend container.
9. Verify the public `/healthz` endpoint.
10. Run the existing public launch smoke test with `--public --wechat` in the pinned Node 24 container.

On failure, the script prints container status and the last 200 lines from Caddy, frontend, and backend logs without printing `.env.production`. It does not delete volumes and does not attempt an unsafe automatic database rollback.

## Implementation boundaries

- Add `.github/workflows/deploy-production.yml` for orchestration and approval.
- Add `scripts/deploy-production.sh` for the audited remote deployment sequence.
- Add `scripts/deployment-cd.test.mjs` to enforce trigger, approval, SHA pinning, SSH host verification, safe Git behavior, health checks, and the absence of destructive volume operations.
- Update the existing CI deployment-contract test command so every pull request validates the CD workflow and script.
- Update `docs/DEPLOYMENT.md` with GitHub Environment setup, secret names, deploy-user requirements, first-run verification, and failure recovery.

No application source code, database schema, production environment values, or business data will be changed.

## Verification

The implementation will run:

- `node --test scripts/deployment-cd.test.mjs scripts/deployment-ci.test.mjs scripts/deployment-documentation.test.mjs`
- the complete deployment contract test suite already used by CI;
- YAML parsing through GitHub-compatible static assertions and the existing repository workflow checks;
- `shellcheck` when available, otherwise `bash -n scripts/deploy-production.sh` plus behavior assertions;
- `git diff --check`.

The first real deployment remains pending until the repository owner restricts the `production` Environment to `main` and configures all five SSH secrets. The first manual run should be started and observed while an operator is available to confirm container health and the course-detail route on the live site.
