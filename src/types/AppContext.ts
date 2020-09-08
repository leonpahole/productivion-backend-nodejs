import { Request, Response } from "express";
import { Redis } from "ioredis";
import { createUserLoader } from "../utils/createUserLoader";
import { createCapabilityLoader } from "../utils/createCapabilityLoader";

export type AppContext = {
  req: Request & { session: Express.Session & { userId: number } };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  capabilityLoader: ReturnType<typeof createCapabilityLoader>;
};
