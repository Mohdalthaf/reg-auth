import mysql from "mysql2/promise";

let connection; // Variable to hold the database connection instance

// Function to connect to the MySQL database
export const connectToDatabase = async () => {
  try {
    // Check if a connection already exists
    if (!connection) {
      // If no connection exists, create a new one using environment variables for configuration
      connection = await mysql.createConnection({
        host: process.env.DB_HOST, // Database host address
        user: process.env.DB_USER, // Database user name
        password: process.env.DB_PASSWORD, // Database password
        database: process.env.DB_NAME, // Database name
      });
    }
    return connection; // Return the database connection
  } catch (err) {
    // Log any errors that occur during the connection process
    console.log(err);
  }
};
