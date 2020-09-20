import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "../resolvers/UserResolver";
import IORedis from "ioredis";
import { Express } from "express";
import { AppError, InputError } from "../types/AppError";
import {
  AUTH_ERROR,
  ARGUMENT_VALIDATION_ERROR,
  USER_UNVERIFIED_ERROR,
} from "../constants";
import { logger } from "../logger";
import { ProjectResolver } from "../resolvers/ProjectResolver";
import { TaskResolver } from "../resolvers/TaskResolver";
import { UserManagementResolver } from "../resolvers/UserManagementResolver";
import { createUserLoader } from "../utils/createUserLoader";
import { createCapabilityLoader } from "../utils/createCapabilityLoader";
import { CommentResolver } from "../resolvers/CommentResolver";

export const configureGraphQLServer = async (
  app: Express,
  redis: IORedis.Redis
) => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        UserResolver,
        ProjectResolver,
        TaskResolver,
        UserManagementResolver,
        CommentResolver,
      ],
      dateScalarMode: "timestamp",
      validate: true,
      directives: [],
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      capabilityLoader: createCapabilityLoader(),
    }),
    formatError: (err): AppError => {
      if (err.message.includes(ARGUMENT_VALIDATION_ERROR)) {
        return {
          type: "validation-error",
          message: "",
          inputErrors: err.extensions?.exception?.validationErrors.map(
            (e: {
              property: string;
              constraints: { [key: string]: string };
            }): InputError => {
              return {
                inputName: e.property,
                messages: Object.keys(e.constraints).map((key) => {
                  return { [key]: e.constraints[key] };
                }),
              };
            }
          ),
        };
      } else if (err.message.includes(AUTH_ERROR)) {
        return {
          message: err.message,
          type: "auth-error",
        };
      } else if (err.message.includes(USER_UNVERIFIED_ERROR)) {
        return {
          message: err.message,
          type: "unverified-error",
        };
      }

      logger.error(err);

      return {
        message: "Internal error",
        type: "system-error",
      };
    },
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });
};
