export const __prod__ = process.env.NODE_ENV === "production";
export const __dev__ = process.env.NODE_ENV === "development";

export const COOKIE_NAME = "qid";

export const FORGOT_PASSWORD_PREFIX = "forget-password:";

export const FORGOT_PASSWORD_LINK_EXPIRY_HOURS = 3;
export const FORGOT_PASSWORD_LINK_EXPIRY_MS =
  1000 * 60 * 60 * 24 * FORGOT_PASSWORD_LINK_EXPIRY_HOURS;

export const AUTH_ERROR = "Authentication error";
export const USER_UNVERIFIED_ERROR = "Unverified error";

export const ARGUMENT_VALIDATION_ERROR = "Argument Validation Error";

export const PG_UNIQUE_ERROR_CODE = "23505";
