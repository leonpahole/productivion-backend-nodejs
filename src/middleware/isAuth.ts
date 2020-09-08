import { MiddlewareFn } from "type-graphql";
import { AppContext } from "../types/AppContext";
import { AUTH_ERROR } from "../constants";

export const isAuth: MiddlewareFn<AppContext> = ({ context, args }, next) => {
  if (!context.req.session.userId) {
    throw new Error(AUTH_ERROR);
  }

  console.log(args);

  return next();
};
