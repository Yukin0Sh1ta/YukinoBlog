import mysql from "mysql2/promise";

const pool: mysql.Pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "data",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

export default pool;
