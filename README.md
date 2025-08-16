🏷️ Mini Auction System

A full-stack real-time auction system built with React, Node.js, Express, Supabase (Postgres), Sequelize, Socket.io, Redis (Upstash), and SendGrid.
Users can create auctions, place bids live, receive notifications, and complete sales with invoices.

🚀 Features

User Accounts (seller / buyer roles)

Auction Creation with configurable start time & duration

Real-Time Bidding via Socket.io

Bid Increment Validation (ensures fair bidding)

Notifications for new bids, outbids, auction win/loss

Auction End Flow

Seller can accept, reject, or counter-offer

Email Integration (SendGrid) for final results

PDF Invoice Generation using PDFKit

Deployment-Ready with Docker + Render

Keep-Alive Cron endpoint (/health)

📂 Project Structure
mini-auction/
├─ Dockerfile
├─ render.yaml
├─ .env.example
├─ README.md
├─ server/                 # Backend (Express + Sequelize)
│  ├─ src/
│  │  ├─ index.js          # Server entrypoint
│  │  ├─ db.js             # DB connection
│  │  ├─ sockets.js        # WebSocket handlers
│  │  ├─ scheduler.js      # Auction scheduler
│  │  ├─ models/           # Sequelize models
│  │  │  ├─ User.js
│  │  │  ├─ Auction.js
│  │  │  ├─ Bid.js
│  │  │  └─ Notification.js
│  │  ├─ routes/           # API routes
│  │  └─ services/         # Redis, Email, Invoice helpers
└─ client/                 # Frontend (React + Vite)
   ├─ src/
   │  ├─ App.jsx
   │  ├─ api.js
   │  ├─ components/
   │  └─ pages/

⚙️ Installation & Setup
1. Clone Repo
git clone https://github.com/yourusername/mini-auction.git
cd mini-auction

2. Install Dependencies

Backend:

cd server
npm install


Frontend:

cd client
npm install

3. Environment Variables

Copy .env.example to .env in the server/ folder:

cp .env.example server/.env


Fill in your credentials:

DATABASE_URL → Supabase Postgres connection string

UPSTASH_REDIS_URL → Redis URL from Upstash

SENDGRID_API_KEY & FROM_EMAIL → SendGrid config

WEB_BASE_URL → Render deployment link

4. Run Locally

Backend:

cd server
npm start


Frontend (dev server):

cd client
npm run dev


App runs at http://localhost:5173 (Vite default).

🐳 Docker (One-Click Deployment)

Build and run with Docker:

docker build -t mini-auction .
docker run -p 8080:8080 --env-file server/.env mini-auction

☁️ Deployment on Render

Uses render.yaml for infra-as-code

Auto-builds Dockerfile

Add environment variables in Render dashboard

🔗 API Endpoints
User

POST /api/auctions/demo/login → quick demo login

Auctions

POST /api/auctions → create auction

GET /api/auctions → list all

GET /api/auctions/:id → get single auction

Bids

GET /api/bids/:auctionId → fetch all bids

Seller Decisions

POST /api/decisions/:auctionId/accept

POST /api/decisions/:auctionId/reject

POST /api/decisions/:auctionId/counter

🔔 Notifications

Live in-app via Socket.io

Stored in Postgres

Emails via SendGrid

📧 Invoice Example

When seller accepts a bid:

PDF Invoice generated with PDFKit

Sent to buyer & seller as attachment

🛠 Tech Stack

Frontend: React 

Backend: Node.js + Express

Database: Supabase Postgres (Sequelize ORM)

Cache: Upstash Redis

Real-Time: Socket.io

Email: SendGrid

PDF: PDFKit

Deployment: Render + Docker

🤝 Contributing

Fork repo

Create branch: git checkout -b feature-name

Commit changes: git commit -m "Added new feature"

Push branch: git push origin feature-name

Open PR

📜 License

MIT License © 2025 – Mini Auction Project
