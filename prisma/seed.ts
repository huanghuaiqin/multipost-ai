import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env.development.local') });

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is missing in environment variables');
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL,
    },
  },
  log: ['query'],
});

const dbPath = path.join(process.cwd(), 'data', 'db.json');

async function main() {
  if (!fs.existsSync(dbPath)) {
    console.log('No data/db.json found. Skipping seed.');
    return;
  }

  const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  console.log(`Seeding database...`);

  // Seed News
  for (const news of data.news) {
    await prisma.news.upsert({
      where: { id: String(news.id) },
      update: {},
      create: {
        id: String(news.id),
        title: news.title,
        summary: news.summary,
        date: news.date,
        category: news.category,
        categoryColor: news.categoryColor,
        icon: news.icon,
        iconColor: news.iconColor,
        imageColor: news.imageColor,
      },
    });
  }

  // Seed Learning
  for (const learning of data.learning) {
    // Convert content object to Markdown string if it's an object
    let contentString = '';
    if (typeof learning.content === 'string') {
      contentString = learning.content;
    } else if (learning.content && typeof learning.content === 'object') {
      if (learning.content.text) {
        contentString = learning.content.text;
      } else if (learning.content.items) {
         // Keep items as JSON string for specific UI rendering in AiLearningView
         contentString = JSON.stringify(learning.content);
      } else {
        contentString = JSON.stringify(learning.content);
      }
    }

    await prisma.learning.upsert({
      where: { id: learning.id },
      update: {},
      create: {
        id: learning.id,
        title: learning.title,
        desc: learning.desc,
        category: learning.category || '使用教程',
        content: contentString,
        icon: learning.icon,
        color: learning.color,
        bgColor: learning.bgColor,
        borderColor: learning.borderColor,
      },
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
