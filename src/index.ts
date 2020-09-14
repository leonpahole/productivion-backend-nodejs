import "reflect-metadata";

if (process.env.NODE_ENV !== "production") {
  require("dotenv-safe").load();
}

import { connectToDatabase } from "./boot/connectToDatabase";
import { configureExpress } from "./boot/configureExpress";
import { setUpSessionRedis } from "./boot/setupSessionRedis";
import { configureGraphQLServer } from "./boot/configureGraphQLServer";
import { logger } from "./logger";

const main = async () => {
  await connectToDatabase();

  const { redis, RedisStore } = setUpSessionRedis();

  const { app } = await configureExpress(redis, RedisStore);

  await configureGraphQLServer(app, redis);
};

main().catch((err) => {
  logger.error(err);
});
