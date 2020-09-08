declare namespace NodeJS {
  export interface ProcessEnv {
    DB_HOST: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    CORS_ORIGIN: string;
    COOKIE_DOMAIN: string;
    PORT: string;
    SESSION_SECRET: string;
  }
}
