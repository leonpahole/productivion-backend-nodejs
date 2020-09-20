declare namespace NodeJS {
  export interface ProcessEnv {
    DB_HOST: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    FRONTEND_URL: string;
    COOKIE_DOMAIN: string;
    PORT: string;
    JWT_SECRET: string;
    SESSION_SECRET: string;
    REDIS_HOST: string;
    NODE_ENV: string;
    : string;
    MAILGUN_DOMAIN: string;
    MAILGUN_API_KEY: string;
    : string;
    MAIL_FROM: string;
  }
}
