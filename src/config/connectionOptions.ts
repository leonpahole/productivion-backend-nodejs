import { ConnectionOptions } from "typeorm";
import { __prod__ } from "../constants";

export const connectionOptions: ConnectionOptions = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  type: "postgres",
  port: 5432,
  entities: ["dist/entities/*.js"],
  migrations: ["dist/migrations/*.js"],
  cli: {
    migrationsDir: "src/migrations",
  },
  logging: !__prod__,
  synchronize: false,
};
