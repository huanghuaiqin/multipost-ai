import { sql } from '@vercel/postgres';

// Duplicate interfaces to avoid circular dependency
// or we can move interfaces to a separate file.
// For simplicity, let's redefine here or assume we will move them to `types.ts`.
// But to be quick, let's redefine compatible shapes.

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

// Ensure tables exist
async function ensureTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      category_color TEXT,
      icon TEXT,
      icon_color TEXT,
      image_color TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS learning (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      bg_color TEXT,
      border_color TEXT,
      "desc" TEXT NOT NULL,
      content JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

export async function readDBPostgres(): Promise<DB> {
  try {
    // We attempt to create tables if they don't exist (lazy init)
    await ensureTables();

    const newsResult = await sql`SELECT * FROM news ORDER BY id DESC`;
    const learningResult = await sql`SELECT * FROM learning ORDER BY created_at DESC`;

    const news = newsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      date: row.date,
      category: row.category,
      categoryColor: row.category_color,
      icon: row.icon,
      iconColor: row.icon_color,
      imageColor: row.image_color
    })) as NewsItem[];

    const learning = learningResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      icon: row.icon,
      color: row.color,
      bgColor: row.bg_color,
      borderColor: row.border_color,
      desc: row.desc,
      content: row.content
    })) as LearningItem[];

    return { news, learning };
  } catch (error) {
    console.error('Postgres read error:', error);
    // Return empty if error (or maybe throw?)
    return { news: [], learning: [] };
  }
}

export async function writeDBPostgres(data: DB) {
  // This is a "dumb" implementation that overwrites everything to match JSON behavior
  try {
    await ensureTables();

    // Clear tables
    // Note: This is destructive! Ideally we use proper UPSERT or dedicated actions.
    await sql`TRUNCATE TABLE news, learning`;

    // Insert News
    for (const item of data.news) {
      await sql`
        INSERT INTO news (id, title, summary, date, category, category_color, icon, icon_color, image_color)
        VALUES (${Number(item.id)}, ${item.title}, ${item.summary}, ${item.date}, ${item.category}, ${item.categoryColor}, ${item.icon}, ${item.iconColor}, ${item.imageColor})
      `;
    }

    // Insert Learning
    for (const item of data.learning) {
      await sql`
        INSERT INTO learning (id, title, icon, color, bg_color, border_color, "desc", content)
        VALUES (${item.id}, ${item.title}, ${item.icon}, ${item.color}, ${item.bgColor}, ${item.borderColor}, ${item.desc}, ${JSON.stringify(item.content)})
      `;
    }
  } catch (error) {
    console.error('Postgres write error:', error);
    throw error;
  }
}
