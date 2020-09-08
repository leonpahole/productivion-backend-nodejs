import { RedisStore } from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import IORedis from "ioredis";
import { COOKIE_NAME, __prod__ } from "../constants";
import { logger } from "../logger";

export const configureExpress = async (
  redis: IORedis.Redis,
  RedisStore: RedisStore
) => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );

  app.set("trust proxy", 1);

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__,
        domain: __prod__ ? process.env.COOKIE_DOMAIN : undefined,
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    })
  );

  app.listen(parseInt(process.env.PORT), () => {
    logger.info("Server listening on port %s", process.env.PORT);
  });

  return { app };
};
