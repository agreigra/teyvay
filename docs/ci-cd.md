# CI/CD — Supabase migrations across environments

This repo ships database changes as **versioned SQL migrations** in
`supabase/migrations/`. Those files are the single source of truth for the
schema. CI applies them to the hosted projects automatically (Development) or
behind a manual gate (Production). Nobody edits a hosted database by hand.

## 1. Environments

| Environment | Supabase project        | Who deploys                         | Trigger                          |
| ----------- | ----------------------- | ----------------------------------- | -------------------------------- |
| Local       | `supabase start` (local)| Each developer                      | Manual (`supabase migration up`) |
| Development | Hosted (integration)    | CI, automatically                   | Merge/push to `develop`          |
| Production  | Hosted (real users)     | CI, **after manual approval**       | Push to `main` + reviewer approval |

## 2. Repository structure

```text
.
├── .github/
│   └── workflows/
│       ├── migrations-validate.yml   # PR gate: apply to throwaway DB + lint + drift check
│       ├── deploy-develop.yml        # auto-deploy to Development on merge to develop
│       └── deploy-production.yml     # manual-approval deploy to Production on main
├── supabase/
│   ├── config.toml                   # project_id = "teyvay", major_version = 17
│   └── migrations/                   # *.sql — the source of truth, applied in filename order
└── docs/
    └── ci-cd.md                      # this file
```

## 3. GitHub Environments configuration

Create two environments under **Settings → Environments**:

### `development`
- No required reviewers (deploys automatically).
- Optional: restrict deployment branch to `develop`.
- Secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`
  (all scoped to the **Development** project).

### `production`
- **Required reviewers: 1–2 trusted people.** This is the manual approval gate.
- **Deployment branches: `main` only.**
- Optional **wait timer** (e.g. 5 min) to allow a last-second cancel.
- Secrets: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`
  (all scoped to the **Production** project).

Environment-scoped secrets (not repo-wide) guarantee a Development run can never
obtain Production credentials.

## 4. Required GitHub secrets

Set these **per environment** (same names, different values):

| Secret                   | What it is                                                                 | Where to get it |
| ------------------------ | -------------------------------------------------------------------------- | --------------- |
| `SUPABASE_ACCESS_TOKEN`  | Personal/Service access token the CLI authenticates with (`supabase link`) | Dashboard → Account → Access Tokens |
| `SUPABASE_DB_PASSWORD`   | Database password used by `supabase db push`                               | Project → Settings → Database |
| `SUPABASE_PROJECT_ID`    | The project ref (e.g. `abcdwxyz...`) of that environment's project         | Project → Settings → General (Reference ID) |

> The local `config.toml` `project_id = "teyvay"` is only a local alias — the
> hosted **project ref** is what `supabase link --project-ref` needs.

Prefer a dedicated **service account / machine user** to own the access token so
deploys don't break when a person leaves.

## 5. Development deployment workflow

`deploy-develop.yml` — on push to `develop`:
1. `validate` job: spins a fresh `postgres:17` and runs `supabase migration up`
   to prove the migrations apply cleanly.
2. `deploy` job (needs `validate`, bound to `development` env):
   `supabase link` → `supabase db push --dry-run` → `supabase db push`.
3. If any migration errors, `db push` exits non-zero and the run **fails**.

## 6. Production deployment workflow

`deploy-production.yml` — on push to `main`:
1. Same `validate` job on a throwaway DB.
2. `deploy` job is bound to the `production` environment → GitHub **pauses the
   run and requests reviewer approval**. Nothing touches Production until a
   reviewer approves.
3. After approval: `link` → `db push --dry-run` → `db push`. Failure fails the run.

`workflow_dispatch` is enabled so you can re-run the deploy manually after fixing
a problem, without an empty commit.

## 7. Migration validation workflow

`migrations-validate.yml` runs on every PR into `develop`/`main`:
- Applies all migrations to a **fresh, ephemeral** Postgres 17 (no hosted
  project touched).
- `supabase db lint --level warning` — fails on risky/invalid schema.
- `supabase db diff` — fails if applying the migrations doesn't reproduce the
  schema exactly (catches drift / changes made outside migration files).

Make this check **required** in branch protection (section 8).

## 8. Branch protection rules (recommended)

**`develop`**
- Require PR before merge (≥1 approval).
- Require status check: `Validate migrations / validate`.
- Require branches up to date before merge.
- Dismiss stale approvals on new commits.

**`main`**
- Require PR before merge (PRs come from `develop`).
- Require status check: `Validate migrations / validate`.
- Require linear history; restrict who can push.
- (Production approval itself is enforced by the `production` Environment.)

## 9. Supabase CLI — install & usage

CI installs the CLI via `supabase/setup-cli@v1`. Key commands:

```bash
# Local development
supabase start                       # local stack
supabase migration new <name>        # create a new timestamped migration
supabase migration up                # apply pending migrations locally
supabase db reset                    # rebuild local DB from all migrations (clean test)

# Validation (CI / locally against any DB)
supabase migration up  --db-url "$DB_URL"
supabase db lint       --db-url "$DB_URL" --level warning
supabase db diff       --db-url "$DB_URL"

# Deploy to a hosted project
supabase link --project-ref "$SUPABASE_PROJECT_ID"   # uses SUPABASE_ACCESS_TOKEN
supabase db push --dry-run                           # preview pending migrations
supabase db push                                     # apply (uses SUPABASE_DB_PASSWORD)
```

**Author migrations safely:** always create them with `supabase migration new`
(timestamp ordering), keep each migration forward-only and idempotent where
possible (`if not exists`, `create or replace`), and test with
`supabase db reset` locally before opening a PR.

## 10. Rollback strategy

Supabase migrations are **forward-only** — `db push` has no automatic "down".
Strategy, in order of preference:

1. **Roll forward (default).** Write a new migration that reverts the bad change
   and ship it through the same pipeline. Safest and auditable.
2. **Pre-deploy backup (Production).** Production should have PITR / daily
   backups enabled (Supabase dashboard). For high-risk migrations, take a manual
   snapshot/backup immediately before approving the deploy. Restore is a
   break-glass action done from the dashboard, not CI.
3. **Expand/contract for destructive changes.** Never drop a column/table in the
   same release that stops using it. Phase 1: add new + dual-write. Phase 2 (a
   later release, after the app no longer references the old shape): remove old.
   This keeps every intermediate state rollback-free.
4. **Test restores periodically** so the backup path is known to work.

Avoid editing/deleting an already-applied migration file — it diverges history
across environments. Fix forward instead.

## 11. Security best practices

- **Environment-scoped secrets** — Production credentials live only on the
  `production` environment; a `develop` run cannot read them.
- **Manual approval + branch restriction** on `production` — only `main`, only
  after a human approves.
- **Least-privilege token** — use a dedicated service account for
  `SUPABASE_ACCESS_TOKEN`; rotate on a schedule and on offboarding.
- **`permissions: contents: read`** on every workflow — minimal `GITHUB_TOKEN`.
- **Pin/trust actions** — official `actions/*` and `supabase/setup-cli`; pin to
  SHAs if your org requires it.
- **`concurrency` without cancel-in-progress** on deploy jobs — a migration push
  is never interrupted mid-flight.
- **No secrets in logs** — pass them only as `env:`; `db push --dry-run` prints
  migration names, not credentials.
- **Protected branches** — no direct pushes to `develop`/`main`; everything via
  reviewed PRs.
- **Audit trail** — every schema change is a committed migration + an approved
  Actions run.
