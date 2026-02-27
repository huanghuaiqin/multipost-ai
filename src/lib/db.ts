import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

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

export function readDB(): DB {
  if (!fs.existsSync(DB_PATH)) {
    return { news: [], learning: [] };
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

export function writeDB(data: DB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
