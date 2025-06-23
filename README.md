# Military Asset Tracker

A full-stack web application for managing military assets, assignments, purchases, transfers, and audit logs.

## Features
- Asset overview dashboard
- Assignment, purchase, and transfer forms
- User management
- Audit logs and recent activity
- Responsive UI with metrics and tables

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, Drizzle ORM
- **Database:** (Configure as needed, e.g., PostgreSQL)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/akalekurthi/MilitaryAssetTracker.git
   cd MilitaryAssetTracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   - Configure your database connection in `server/db.ts` or via environment variables.
   - Run migrations if needed.
4. Start the development servers:
   - **Backend:**
     ```bash
     cd server
     npm install
     npm run dev
     ```
   - **Frontend:**
     ```bash
     cd client
     npm install
     npm run dev
     ```

## Deployment (Render)

### Backend
- Create a new Web Service on [Render](https://dashboard.render.com/)
- Root Directory: `server/`
- Build Command: `npm install`
- Start Command: `node index.js` or `npx tsx index.ts`
- Set environment variables as needed

### Frontend
- Create a new Static Site on Render
- Root Directory: `client/`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

## License
MIT
