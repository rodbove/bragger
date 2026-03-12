import Database, { type Database as DatabaseType } from "better-sqlite3";
import { mkdirSync } from "fs";
import { logger } from "../utils/logger.js";

const DB_PATH = "data/bragger.db";

mkdirSync("data", { recursive: true });

export const db: DatabaseType = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

logger.info(`Database opened at ${DB_PATH}`);
