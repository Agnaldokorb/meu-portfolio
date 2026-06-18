import mysql, { type Pool } from "mysql2/promise";

import { getServerEnv } from "./env";

declare global {
  var portfolioMysqlPool: Pool | undefined;
}

export function getDbPool(): Pool {
  if (globalThis.portfolioMysqlPool) {
    return globalThis.portfolioMysqlPool;
  }

  const env = getServerEnv();

  globalThis.portfolioMysqlPool = mysql.createPool({
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true,
    dateStrings: true,
  });

  return globalThis.portfolioMysqlPool;
}
