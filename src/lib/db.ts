import fs from 'fs';
import path from 'path';
import { readDBPostgres, writeDBPostgres } from './db-postgres';

// Define interfaces locally to avoid circular dependencies if we used to import from db.ts
// But since we are modifying db.ts, these are the source of truth now.

export interface NewsItem {
  id: number | string;
  title: string;
  summary: string;
  date: string;
  category: string;
  categoryColor: string;
  icon: string;
  iconColor: string;
  imageColor: string;
}

export interface LearningItem {
  id: string;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  desc: string;
  content: {
    title: string;
    text?: string;
    items?: Array<{
      label: string;
      prompt: string;
    }>;
  };
}

export interface DB {
  news: NewsItem[];
  learning: LearningItem[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const USE_POSTGRES = process.env.USE_POSTGRES === 'true' || !!process.env.POSTGRES_URL;

// Legacy file-based read
function readDBFile(): DB {
  if (!fs.existsSync(DB_PATH)) {
    return { news: [], learning: [] };
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading DB file:", error);
    return { news: [], learning: [] };
  }
}

// Legacy file-based write
function writeDBFile(data: DB) {
  // Ensure directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Unified Async API (Important: now all DB access must be async!)
export async function readDB(): Promise<DB> {
  if (USE_POSTGRES) {
    return await readDBPostgres();
  } else {
    // Wrap sync file IO in promise for unified API
    return Promise.resolve(readDBFile());
  }
}

export async function writeDB(data: DB): Promise<void> {
  if (USE_POSTGRES) {
    await writeDBPostgres(data);
  } else {
    writeDBFile(data);
    return Promise.resolve();
  }
}
