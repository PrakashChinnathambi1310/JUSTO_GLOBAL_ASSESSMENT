// Get the client
import mysql from "mysql2/promise";
import { config } from "../config/app.config.js";

// Create the connection to database
export const connection = await mysql.createConnection({
  host: config.DB_HOST,
  user: config.DB_USERNAME,
  database: config.DB_NAME,
  password: config.DB_PASSWORD,
  port: 3306,
});

export const initializeDbConnection = async () => {
  try {
    await connection.connect();
    console.log("database connected");
  } catch (error) {
    console.log("failed to connect db", error);
  }
};
