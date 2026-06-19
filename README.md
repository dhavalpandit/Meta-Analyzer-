# ProblemPulse MVP

A structured daily problem-analysis tool for Meta engineers.

## Tech Stack
- **Frontend**: Vite + React, Tailwind CSS, Recharts, Lucide React
- **Backend**: Node.js + Express, Better-SQLite3
- **Database**: SQLite (local `problems.db`)

## Project Structure
- `/backend`: Express server and database logic.
- `/frontend`: Vite + React application.

## Getting Started

### Prerequisites
- Node.js installed.
- Dependencies installed in both `backend/` and `frontend/` directories (`npm install`).

### Development Setup

To run the full application in development mode with hot-reloading:

1. **Start the Backend Server**:
   ```bash
   cd backend
   PORT=3001 node index.js
   ```
   The backend will run on port 3001.

2. **Start the Frontend Dev Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   The Vite dev server will run on port 3000 and proxy `/api` requests to the backend on port 3001.

### Production Build

1. **Build the Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the Unified Server**:
   ```bash
   cd backend
   PORT=3000 node index.js
   ```
   The backend will now serve the static frontend from `frontend/dist` and handle API requests, all on port 3000.
