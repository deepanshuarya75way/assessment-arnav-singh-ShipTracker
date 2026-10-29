# ShipTrack

A full-stack shipment/logistics tracking dashboard built with the MERN stack (MongoDB, Express, React, Node.js).

## Project structure

```
ShipTrack/
├── client/          # React frontend (Vite + React Router + Axios)
└── server/          # Express REST API (Mongoose + JWT auth)
```

Each half is a separate, independently runnable Node project with its own `package.json` and `.env`. This mirrors how you'd actually deploy them (frontend on Vercel/S3, backend on AWS EC2/Elastic Beanstalk) as two separate services talking over HTTP.

## Status

- [x] Backend scaffolding + auth (signup/login/JWT/protected route)
- [x] Shipment + StatusUpdate schemas
- [x] Shipment CRUD API (role-based access, status timeline, dashboard summary)
- [x] React frontend — auth, dashboard (summary cards + search/filter), create shipment, shipment detail with visual timeline and admin controls
- [x] Deployment

## Running the backend locally

```bash
cd server
npm install
cp .env.example .env
# edit .env: paste in your MongoDB Atlas connection string and a JWT secret
npm run dev
```

The API will start on `http://localhost:5000`. Health check: `GET http://localhost:5000/api/health`.

## Running the frontend locally

```bash
cd client
npm install
cp .env.example .env
# edit .env if your API isn't running on the default http://localhost:5000/api
npm run dev
```

The app will start on `http://localhost:5173`. Run the backend first (or alongside) — the frontend calls it directly for auth and shipment data.

## Environment variables

See `server/.env.example` for the backend's required variables (`MONGO_URI`, `JWT_SECRET`, etc). The client's `.env.example` will be added alongside the frontend.
