import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/p2p",
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET || "your_access_token_secret",
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret",
};
