# Fiber Business

Full-stack web application with **Next.js** (frontend), **Express.js** (backend), and **MongoDB**.

## Project Structure

```
fiber business/
├── frontend/     # Next.js + TypeScript + Tailwind CSS
├── backend/      # Express.js + TypeScript + Mongoose
└── package.json  # Root scripts to run both apps
```

## Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

## Setup

1. **Install dependencies** (from the project root):

   ```bash
   npm run install:all
   ```

2. **Configure environment variables**:

   - Backend: copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`
   - Frontend: copy `frontend/.env.local.example` to `frontend/.env.local`

3. **Start MongoDB** — choose one option:

   **Option A — Local install (Windows)**  
   Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community), then start the service from Services (`MongoDB`) or run:

   ```bash
   mongod
   ```

   **Option B — MongoDB Atlas (cloud, no local install)**  
   Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas), copy the connection string, and set it in `backend/.env`:

   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fiber-business
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

## API

| Endpoint        | Method | Description      |
|-----------------|--------|------------------|
| `/api/health`   | GET    | Health check     |

## Tech Stack

| Layer    | Technology                    |
|----------|-------------------------------|
| Frontend | Next.js 16, React 19, Tailwind |
| Backend  | Express.js, TypeScript        |
| Database | MongoDB (Mongoose)            |
