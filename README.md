# Habitz

A private, mobile-first habit tracker built with Next.js, Supabase, shadcn/ui, and Apache ECharts.

The repository is deployment-neutral. Habit names, targets, owner identity, URLs, and credentials are environment configuration and must not be committed.

## Requirements

- Node.js 22 or newer
- npm
- A Supabase project
- A GitHub OAuth App configured through Supabase
- Optional: Supabase CLI and Docker for a fully local database

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and replace every placeholder. `.env.local` is ignored by Git.

3. Create a Supabase project, then apply the migration:

   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```

4. In Supabase Authentication, enable GitHub. Create a GitHub OAuth App using the provider callback URL shown by Supabase, normally:

   ```text
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

5. In Supabase URL Configuration, add:

   ```text
   http://localhost:3000/auth/callback
   ```

6. Set `ALLOWED_GITHUB_USER_ID` to the numeric ID of the only permitted GitHub account. This is intentionally not a username because numeric IDs are immutable.

7. Sign in once with the owner account, then disable **Allow new users to sign up** in Supabase Authentication settings. Confirm that `auth.users` contains only the owner and remove any unexpected accounts. The application allowlist protects the UI, while disabling signups prevents other GitHub users from creating their own rows through the public Supabase API.

8. Start the application:

   ```bash
   npm run dev
   ```

   Open <http://localhost:3000>.

## Habit configuration

`HABIT_CONFIG_JSON` is an ordered JSON array. Habit keys must be unique kebab-case values and should remain stable after entries have been recorded.

Duration habit:

```json
{
  "key": "example-duration",
  "label": "Practice",
  "type": "duration",
  "target": 15,
  "unit": "min",
  "icon": "activity",
  "presets": [5, 15]
}
```

Boolean habit:

```json
{
  "key": "example-boolean",
  "label": "Daily choice",
  "type": "boolean",
  "icon": "check",
  "excludedWeekdays": [2]
}
```

Measurement habit:

```json
{
  "key": "weight",
  "label": "Weight",
  "type": "measurement",
  "unit": "kg",
  "min": 20,
  "max": 300,
  "step": 0.1,
  "icon": "scale"
}
```

`excludedWeekdays` is optional and removes a habit from logging and scoring on
the listed days. Weekdays use `0` for Sunday through `6` for Saturday.

Supported icons are `activity`, `brain`, `candy`, `check`, `dumbbell`, `glass-water`, `piano`, `scale`, and `screen-off`.

## Optional fully local Supabase

With Docker running:

```bash
npx supabase start
npx supabase db reset
```

Use the local URL and publishable/anonymous key printed by `supabase status` in `.env.local`. GitHub OAuth still requires provider credentials and a callback reachable by the browser.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Install Playwright's browser once before the end-to-end smoke test:

```bash
npx playwright install chromium
```

## Security

- Real `.env` files, Supabase local state, dumps, and Vercel metadata are ignored.
- The browser uses only the Supabase publishable key; Row Level Security limits every row to its authenticated owner.
- After provisioning the owner, Supabase new-user signups should remain disabled so no other authenticated storage users can be created.
- The OAuth client secret belongs only in Supabase provider settings.
- Never commit production data, owner IDs, provider credentials, project references, or screenshots containing private habit data.
- If a secret enters Git history, rotate it immediately rather than only deleting the file.
