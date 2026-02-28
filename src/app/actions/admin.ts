"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// Simple password check
export async function verifyAdmin(password: string) {
  // In a real app, use environment variables. 
  // For this simple request, we'll use a hardcoded simple password.
  return password === "admin123";
}

// --- News Actions ---

export async function getNews() {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return news;
  } catch (error) {
    console.error("Error reading news:", error);
    return [];
  }
}

export async function addNewsItem(item: any) {
  try {
    await prisma.news.create({
      data: {
        title: item.title,
        summary: item.summary,
        date: item.date,
        category: item.category,
        categoryColor: item.categoryColor || "text-sky-600 bg-sky-50 border-sky-100",
        icon: item.icon || "TrendingUp",
        iconColor: item.iconColor || "text-sky-500",
        imageColor: item.imageColor || "bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-950 dark:to-slate-900"
      },
    });
    
    revalidatePath("/"); // Revalidate homepage
    return { success: true };
  } catch (error) {
    console.error("Error adding news:", error);
    return { success: false, error: "Failed to save news item" };
  }
}

export async function deleteNewsItem(id: number | string) {
  try {
    await prisma.news.delete({
      where: { id: String(id) },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting news:", error);
    return { success: false, error: "Failed to delete news item" };
  }
}

// --- Learning Actions ---

export async function getLearning() {
  try {
    const learning = await prisma.learning.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // Transform content string back to object if needed for frontend compatibility
    // However, frontend should be updated to handle string content (Markdown)
    return learning.map(item => ({
      ...item,
      // Frontend expects content object for now, but we are moving to Markdown string.
      // We'll return it as is, and update frontend components to handle it.
    }));
  } catch (error) {
    console.error("Error reading learning:", error);
    return [];
  }
}

export async function getLearningItem(id: string) {
  try {
    const item = await prisma.learning.findUnique({
      where: { id },
    });
    return item;
  } catch (error) {
    console.error("Error fetching learning item:", error);
    return null;
  }
}

export async function addLearningItem(item: any) {
  try {
    // Determine content string
    let contentString = '';
    if (typeof item.content === 'string') {
      contentString = item.content;
    } else if (item.content && typeof item.content === 'object') {
      if (item.content.text) {
        contentString = item.content.text;
      } else {
        contentString = JSON.stringify(item.content);
      }
    }

    await prisma.learning.create({
      data: {
        title: item.title,
        desc: item.desc,
        category: item.category || '使用教程',
        content: contentString,
        icon: item.icon || "Sparkles",
        color: item.color || "text-sky-500",
        bgColor: item.bgColor || "bg-sky-50 dark:bg-sky-950/30",
        borderColor: item.borderColor || "border-sky-100 dark:border-sky-900",
      },
    });
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error adding learning:", error);
    return { success: false, error: "Failed to save learning item" };
  }
}

export async function deleteLearningItem(id: string) {
  try {
    await prisma.learning.delete({
      where: { id: String(id) },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting learning:", error);
    return { success: false, error: "Failed to delete learning item" };
  }
}
