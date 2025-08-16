import dayjs from 'dayjs';
import { Auction, Bid, User } from './db.js';
import { redis, highestBidKey } from './services/redis.js';

export function startScheduler(io) {
  // Tick every 5s: flip statuses and end auctions
  setInterval(async () => {
    const now = dayjs();

    // Go live
    const scheduled = await Auction.findAll({ where: { status: 'scheduled' } });
    for (const a of scheduled) {
      if (now.isAfter(dayjs(a.goLiveAt)) && now.isBefore(dayjs(a.goLiveAt).add(a.durationMinutes, 'minute'))) {
        a.status = 'live';
        await a.save();
        io.to(a.id).emit('auction_live', { auctionId: a.id });
      }
    }

    // End auctions
    const live = await Auction.findAll({ where: { status: 'live' } });
    for (const a of live) {
      const end = dayjs(a.goLiveAt).add(a.durationMinutes, 'minute');
      if (now.isAfter(end)) {
        a.status = 'ended';
        await a.save();
        const key = highestBidKey(a.id);
        const cached = await redis.get(key);
        let highest = null;

        if (cached) {
          highest = JSON.parse(cached);
        } else {
          const top = await Bid.findOne({ where: { auctionId: a.id }, order: [['amount','DESC']] });
          if (top) highest = { amount: top.amount, userId: top.bidderId };
        }

        io.to(a.id).emit('auction_ended', { auctionId: a.id, highest: highest || null });
      }
    }
  }, 5000);
}
