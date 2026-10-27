# Fiber Business

Full-stack web application with **Next.js** (frontend), **Express.js** (backend), and **MongoDB**.

## Project Structure

```
fiber business/
├── frontend/     # Next.js + TypeScript + Tailwind CSS (Full-stack API routes & UI)
├── backend/      # Express.js + TypeScript + Mongoose (Standalone API server)
└── package.json  # Root scripts to run both apps
```

## Shared Database Setup for Collaborators

For catalog products, admin updates, and landing page edits to be visible to all collaborators and live users, everyone must connect to the **same MongoDB Atlas database**.

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Configure environment variables**:
   - Copy `frontend/.env.local.example` to `frontend/.env.local`
   - Copy `backend/.env.example` to `backend/.env`
   - Set `MONGODB_URI` to your shared MongoDB Atlas cluster connection string:
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.iaghazm.mongodb.net/madeye?retryWrites=true&w=majority
     ```

## Development

Run both frontend and backend together:
```bash
npm run dev
```

Or run them separately:
```bash
npm run dev:frontend   # http://localhost:3000
npm run dev:backend    # http://localhost:5000
```

## Vercel Deployment & Admin Updates

When deployed to Vercel, the Next.js app runs all frontend pages and serverless API routes (`/api/products`, `/api/landing`, `/api/auth/*`, `/api/images/*`).

### 1. Configure Environment Variables in Vercel
In your Vercel Project Dashboard under **Settings → Environment Variables**, add:
- `MONGODB_URI`: The shared MongoDB Atlas connection string.
- `JWT_SECRET`: A secure random secret string.
- `ADMIN_EMAIL`: (e.g. `admin@madeyeenterprises.com`)
- `ADMIN_PASSWORD`: (e.g. `Me13dd530827!K9x`)
- `ADMIN_INVITE_CODE`: (e.g. `MeInvite#7kQ2`)
- Leave `NEXT_PUBLIC_API_URL` **unset** on Vercel so the frontend uses internal Next.js API routes directly.

### 2. How Real-time Catalog & Admin Sync Works
- Any admin signing in on Vercel or locally modifies the **MongoDB Atlas** database directly.
- All product additions, deletions, price updates, and landing page edits are stored centrally in Atlas.
- Every visitor and collaborator automatically sees the changes upon page load, when switching back to the browser tab, or during automatic background refreshes.
- If you previously added products in an older version stored in browser storage (`localStorage`), open `/admin/catalog` and click **"Sync to Database"** to immediately upload them to the shared database.

## API Endpoints

| Endpoint | Methods | Description |
|---|---|---|
| `/api/products` | GET, POST | Public catalog & admin product creation |
| `/api/products/:id` | DELETE | Admin product deletion |
| `/api/landing` | GET, PUT | Public landing content & admin updates |
| `/api/images/upload` | POST | Admin image upload (MongoDB / Cloudflare) |
| `/api/images/:id` | GET | Retrieve stored image |
| `/api/auth/login` | POST | User and admin authentication |
| `/api/auth/register` | POST | User and admin registration |
| `/api/auth/me` | GET | Current session profile |
| `/api/auth/messages` | POST | Customer contact inquiries |
| `/api/auth/admin/*` | GET, PATCH, DELETE | Admin overview, messages, and credentials |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend & Serverless API | Next.js 16, React 19, Tailwind CSS 4 |
| Backend API | Express.js, TypeScript |
| Database | MongoDB Atlas via Mongoose |
