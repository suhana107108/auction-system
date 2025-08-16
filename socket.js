import { Bid, Auction, User } from './db.js';
import { redis, highestBidKey } from './services/redis.js';
import dayjs from 'dayjs';
import { pushNotification } from './services/notifications.js';

export function setupSockets(io) {
  io.on('connection', (socket) => {
    socket.on('join_auction', ({ auctionId, userId }) => {
      socket.join(auctionId);
      socket.data.userId = userId;
      socket.data.auctionId = auctionId;
    });

    socket.on('place_bid', async ({ auctionId, userId, amount, name }) => {
      const auction = await Auction.findByPk(auctionId);
      if (!auction) return;

      const now = dayjs();
      const start = dayjs(auction.goLiveAt);
      const end = start.add(auction.durationMinutes, 'minute');
      if (now.isBefore(start) || now.isAfter(end) || auction.status !== 'live') {
        return socket.emit('error_msg', 'Auction not active.');
      }

      const key = highestBidKey(auctionId);
      const cached = await redis.get(key);
      const highest = cached ? JSON.parse(cached) : { amount: auction.highestBidAmount || auction.startingPrice - auction.bidIncrement };
      const minValid = (highest.amount || auction.startingPrice - auction.bidIncrement) + auction.bidIncrement;

      if (amount < minValid) {
        return socket.emit('error_msg', `Bid must be ≥ ₹${minValid}`);
      }

      // Save bid
      const bid = await Bid.create({ auctionId, bidderId: userId, amount });
      await Auction.update({ highestBidAmount: amount }, { where: { id: auctionId } });
      await redis.set(key, JSON.stringify({ amount, userId, name }), { EX: 60 * 60 });

      io.to(auctionId).emit('bid_update', { amount, userId, name, bidId: bid.id });

      // Notify seller + outbid previous user
      if (highest?.userId && highest.userId !== userId) {
        await pushNotification(io, {
          userId: highest.userId,
          type: 'outbid',
          message: `You've been outbid on ${auction.itemName}. New highest: ₹${amount}`,
          room: auctionId
        });
      }
      await pushNotification(io, {
        userId: auction.sellerId,
        type: 'new_bid',
        message: `New bid ₹${amount} on ${auction.itemName}`,
        room: auctionId
      });
    });
  });
}
