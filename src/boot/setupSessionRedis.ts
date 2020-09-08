import connectRedis from "connect-redis";
import session from "express-session";
import Redis from "ioredis";

export const setUpSessionRedis = () => {
  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);

  return { RedisStore, redis };
};
