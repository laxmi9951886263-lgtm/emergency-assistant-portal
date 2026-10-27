# Emergency Assistant Portal

Angular 20 frontend with a Node.js + Express.js backend. Emergency requests are handled by Express and saved to the existing root `db.json` file.

## Requirements

- Node.js (LTS recommended) and npm

## Install

From the project root:

```bash
npm install
npm --prefix backend install
```

## Run locally

Open two terminals in the project root.

Terminal 1 — Express backend:

```bash
npm run api
```

API health check: <http://localhost:3000/api/health>

Emergency requests endpoint: `http://localhost:3000/api/requests`

Terminal 2 — Angular frontend:

```bash
npm start
```

Open <http://localhost:4200>.

## API routes

- `GET /api/health` — check whether the backend is running.
- `GET /api/requests` — list emergency requests.
- `POST /api/requests` — create an emergency request; validates required fields and the mobile number.

## Notes

- The Angular service uses the Express API. If the API is unavailable, the existing browser `localStorage` fallback remains enabled.
- The current `db.json` file is a simple coursework/demo data store, not a production database. Avoid using real sensitive personal information in a public deployment.
- For production, add authentication, authorization, rate limiting, secure data storage, and a proper database before storing emergency or personal information.
