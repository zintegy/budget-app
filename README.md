# Budget App

A full-stack personal budget tracker built with React, Express, and MongoDB. Track transactions (expenses, income, transfers), manage multiple accounts, categorize spending, and analyze financial trends through charts and tables.

## Tech Stack

- **Frontend:** React 17, Material-UI v4, Chart.js
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas

## Prerequisites

- Node.js (v14.x recommended)
- npm
- A MongoDB Atlas cluster (or local MongoDB instance)

## Setup

1. Install dependencies in all three directories:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. Create a `.env` file in `backend/`:

```
PORT=5004
USERNAME=<your-mongo-username>
PASSWORD=<your-mongo-password>
```

## Running Locally

Start both the frontend and backend together from the project root:

```bash
npm run dev
```

Or run them separately in two terminals:

```bash
# Terminal 1 - Backend
cd backend && npm run watch

# Terminal 2 - Frontend
cd frontend && npm start
```

The backend runs on `http://localhost:5004` and the frontend on `http://localhost:3000`.

## Environment Configuration

The frontend uses environment variables to determine the API base URL. Create React App automatically loads the correct `.env` file based on the context:

- `npm start` (dev) loads `frontend/.env.development` → points at `http://localhost:5004`
- `npm run build` (prod) loads `frontend/.env.production` → points at the ngrok URL

To change the API URL, edit the corresponding file:

```
frontend/.env.development   → local backend
frontend/.env.production    → production/ngrok backend
```

**Note:** After changing a `.env` file, you must restart the dev server for changes to take effect.

## Building for Production

```bash
npm run build
```

This builds the frontend into `frontend/build/`.
