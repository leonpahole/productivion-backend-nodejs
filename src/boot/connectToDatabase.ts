import { __prod__ } from "../constants";
import { createConnection } from "typeorm";
import { connectionOptions } from "../config/connectionOptions";

export const connectToDatabase = async () => {
  const connection = await createConnection(connectionOptions);

  await connection.runMigrations();
};
