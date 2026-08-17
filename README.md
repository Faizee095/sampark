# SAMPARK

SAMPARK provides sell-ready QR tags for vehicles. A customer receives an
unregistered tag, scans it once to register their name, mobile number, and
vehicle number, then places it on the vehicle. Later scans display the
registered details for parking or emergency-related contact.

## Architecture

- `frontend/` — Vite + React application, deployed to Netlify.
- `supabase/` — Postgres schema, Row Level Security policies, and secure
  database functions.

There is no separately hosted backend. Supabase handles the database,
authentication, and controlled QR-tag operations.

## Set up Supabase

1. Create a Supabase project.
2. In **SQL Editor**, run these files in order:

   - `supabase/migrations/202608170001_initial_schema.sql`
   - `supabase/migrations/202608170002_fix_register_tag.sql`

3. In **Authentication > Users**, create the administrator email/password
   account.
4. Copy that user’s UUID and run the final `insert into public.admins ...`
   command from the first migration file.
5. In **Project Settings > API** (or **Connect**), copy the Project URL and
   publishable key.

Never place a Supabase secret key or service-role key in the frontend.

## Run locally

Copy the environment template and add your Supabase values:

```powershell
Copy-Item frontend\.env.example frontend\.env
```

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_public_key
```

Then start the application:

```powershell
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Open `http://localhost:5173/admin` and sign in with the Supabase administrator
account. Create a test tag and scan it before and after registration.

## Deploy to Netlify

1. Push this repository to GitHub.
2. In Netlify, select **Add new site > Import an existing project**.
3. Choose the repository and set:

   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`

4. Add these Netlify environment variables:

   ```text
   VITE_SUPABASE_URL=https://xuejibgecneygwvgkoiv.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```

5. Deploy the site. The included `frontend/netlify.toml` ensures direct QR
   routes such as `/qr/<token>` load correctly.

## Selling tags

From `/admin`, create one or more unregistered tags. Open **Print card** for a
tag and either print it for postal delivery or choose **Save as PDF** in the
browser print dialog for digital delivery.
