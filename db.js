import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: { ssl: process.env.NODE_ENV === 'production' ? { require: true } : false }
});

// MODELS
export const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true }
});

export const Auction = sequelize.define('Auction', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  itemName: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  startingPrice: { type: DataTypes.INTEGER, allowNull: false },
  bidIncrement: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
  goLiveAt: { type: DataTypes.DATE, allowNull: false },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('scheduled','live','ended','closed'), defaultValue: 'scheduled' },
  highestBidAmount: { type: DataTypes.INTEGER, defaultValue: 0 }, // denormalized for ease
  sellerDecision: { type: DataTypes.ENUM('pending','accepted','rejected','countered'), defaultValue: 'pending' },
  counterOfferAmount: { type: DataTypes.INTEGER, allowNull: true }
});

export const Bid = sequelize.define('Bid', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  amount: { type: DataTypes.INTEGER, allowNull: false }
});

export const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  userId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  read: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// RELATIONS
User.hasMany(Auction, { foreignKey: 'sellerId' });
Auction.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });

Auction.hasMany(Bid, { foreignKey: 'auctionId' });
Bid.belongsTo(Auction, { foreignKey: 'auctionId' });

User.hasMany(Bid, { foreignKey: 'bidderId' });
Bid.belongsTo(User, { as: 'bidder', foreignKey: 'bidderId' });

await sequelize.authenticate();
await sequelize.sync();
