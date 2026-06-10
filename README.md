# Parking Ticket Prototype

This workspace contains a minimal file-based prototype for the QR parking-ticket idea.

Architecture
- `backend` — Express server storing data in `db.json` (file-based).
- `frontend` — Vite + React app for Admin and QR registration flows.

Quick start

1) Start backend

```powershell
cd backend
npm install
# copy .env.example to .env and adjust ADMIN_PASS if desired
npm run start
```

2) Start frontend

```powershell
cd frontend
npm install
npm run dev
```

Tailwind CSS
- After updating packages, install Tailwind/PostCSS dev deps and run the dev server. From `frontend` run:

```powershell
npm install
# or if you encounter peer dependency issues:
npm install --legacy-peer-deps
npm run dev
```

If you want to enable automatic Tailwind builds, ensure `postcss.config.cjs` and `tailwind.config.cjs` are present (they are included in the project).

Admin
- Open `http://localhost:5173/admin`
- Use the admin pass `admin123` (or set `ADMIN_PASS` in backend `.env` and supply it in the admin UI)
- Generate QR codes that will display a URL you can print

QR flow
- Scanning a QR opens `http://localhost:5173/qr/:id`
- If unregistered, the user fills name/mobile/car number — submission marks the QR as used and stores details in `backend/db.json`.

Notes
- This is a prototype to iterate on. Next steps: payments, printable/exportable PDFs, admin auth persistence, production DB.
