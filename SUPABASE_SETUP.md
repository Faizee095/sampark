# Deploy SAMPARK with Supabase and Netlify/Vercel

The app no longer needs the Express backend, Docker, or Render. Supabase is now
the database and authentication layer.

## 1. Create the Supabase project

Create a new Supabase project. In **Project Settings > API**, copy:

- Project URL
- Publishable key (not a secret key)

## 2. Create database tables and secure functions

Open **SQL Editor > New query** and paste the full contents of
`supabase/migrations/202608170001_initial_schema.sql`. Click **Run**.

This creates the tags table, enables Row Level Security, and adds controlled
functions for QR lookup, one-time registration, and admin tag management.

## 3. Create an administrator

In **Authentication > Users**, create your administrator user with an email
address and strong password. Copy its UUID and run this in SQL Editor:

```sql
insert into public.admins (user_id) values ('5415ea23-b98b-4725-a25c-f864de17f699');
```

Only users in this table can generate, view, or export tags.

## 4. Run locally

Copy `frontend/.env.example` to `frontend/.env` and add your Project URL and
publishable key. Then run:

```powershell
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Visit `/admin`, sign in with the administrator account, create a test tag, and
scan it before and after registration.

## 5. Deploy the frontend

### Netlify

- Import this repository.
- Set the base directory to `frontend`.
- Build command: `npm run build`
- Publish directory: `dist`
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the site's
  environment variables, then deploy again.

### Vercel

- Import this repository.
- Set the root directory to `frontend`.
- Framework preset: Vite.
- Add the same two environment variables in **Settings > Environment Variables**.

The publishable key is safe in the browser. Do not add a Supabase secret key or
service-role key to the frontend or deployment environment.

## Existing data

The old `backend/db.json` remains recoverable from the repository Git history.
For a production migration, import its registered records into `public.tags`
before deleting the old deployment. Existing UUIDs can be used as both `id` and
`scan_token` so previously printed QR URLs keep working.
