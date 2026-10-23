# My Travel Journal

A React (Vite) travel journal backed by an Express + MongoDB API.
Locally it runs against any MongoDB; in production it runs on **Render** with a **MongoDB Atlas** database.

```
├── App.jsx, index.jsx, components/   React frontend (public page + /admin editor)
├── lib/cloudinary.js                 Photo upload + image resizing helpers
├── public/images/                    Static images
├── server/
│   ├── index.js                      Express app (API + serves the React build in production)
│   ├── db.js                         MongoDB connection + auto-seed when empty
│   ├── models/Entry.js               Mongoose schema
│   ├── routes/entries.js             /api/entries CRUD routes
│   ├── routes/admin.js               Admin key check + Cloudinary upload signing
│   ├── middleware/requireAdmin.js    Checks the x-admin-key header
│   ├── seed.js                       `npm run seed` script
│   └── seedData.js                   Starter entries
└── render.yaml                       Render Blueprint
```

## Run locally

```bash
npm install
cp .env.example .env      # then set MONGODB_URI (local MongoDB or your Atlas string)
npm run dev               # API on :3001, React on :5173 (Vite proxies /api to the API)
```

The first time the server connects to an empty database it adds the three starter entries.
`npm run seed -- --reset` wipes the collection and re-adds them.

## Editing your journal (/admin)

Go to `/admin` on your site (e.g. `https://<your-app>.onrender.com/admin`) and enter your
`ADMIN_KEY`. From there you can add, edit and delete trips and upload photos.
The key is remembered until you close the browser tab, or click **Lock**.

Photos upload straight from your browser to Cloudinary (into a `travel-journal` folder);
the server signs each upload, so your Cloudinary secret never leaves the server.
On the public page, Cloudinary images are automatically resized and compressed.

### Cloudinary setup

1. Sign in at <https://cloudinary.com> and open **Settings → API Keys** (the cloud name is shown
   at the top of the dashboard).
2. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` to Render's
   **Environment** tab (and to your local `.env`).

Without these, the admin page still works: you just paste image links instead of uploading.

## API

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/entries` | public |
| GET | `/api/entries/:id` | public |
| POST | `/api/entries` | `x-admin-key` header |
| PUT | `/api/entries/:id` | `x-admin-key` header |
| DELETE | `/api/entries/:id` | `x-admin-key` header |
| GET | `/api/admin/check` | `x-admin-key` header |
| GET | `/api/admin/upload-signature` | `x-admin-key` header |
| GET | `/api/health` | public |

Example — add an entry:

```bash
curl -X POST https://<your-app>.onrender.com/api/entries \
  -H "content-type: application/json" \
  -H "x-admin-key: <ADMIN_KEY>" \
  -d '{"title":"Machu Picchu","country":"Peru","img":{"src":"https://…","alt":"Machu Picchu"},"dates":"3 Mar, 2024 - 10 Mar, 2024","text":"…","googleMapsLink":"https://maps.app.goo.gl/…"}'
```

## Production database (MongoDB Atlas)

1. Create a free **M0** cluster at <https://cloud.mongodb.com>.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add `0.0.0.0/0` (Render's free plan has no fixed outbound IPs).
4. **Connect → Drivers** → copy the `mongodb+srv://…` string, fill in the password, and add the
   database name before the `?`, e.g. `…mongodb.net/travel-journal?retryWrites=true&w=majority`.

## Deploy to Render

1. Render dashboard → **New → Blueprint** → pick this GitHub repo (it reads `render.yaml`).
2. When prompted, paste the Atlas string as `MONGODB_URI`. `ADMIN_KEY` is generated for you
   (find it under the service's **Environment** tab).
3. Deploy. On first boot the app seeds the starter entries into Atlas.
   Every push to `main` redeploys automatically.

Manual alternative: **New → Web Service**, build command `npm ci --include=dev && npm run build`,
start command `npm start`, and env vars `NODE_ENV=production`, `MONGODB_URI`, `ADMIN_KEY`,
plus the three `CLOUDINARY_*` values.
