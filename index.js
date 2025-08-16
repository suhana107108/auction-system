import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { setupSockets } from './sockets.js';
import auctions from './routes/auctions.js';
import bids from './routes/bids.js';
import decisions from './routes/decisions.js';
import './db.js';
import { startScheduler } from './scheduler.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API
app.use('/api/auctions', auctions);
app.use('/api/bids', bids);
app.use('/api/decisions', decisions);

// Warm-up endpoint for cron-job.org
app.get('/health', (_req, res) => res.json({ ok: true }));

// Serve React build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));
app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
setupSockets(io);
startScheduler(io);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log('Server running on', PORT);
});
