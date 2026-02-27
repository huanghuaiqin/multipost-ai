"use server";

import { revalidatePath } from "next/cache";
import { readDB, writeDB, NewsItem, LearningItem } from "@/lib/db";

// Simple password check
export async function verifyAdmin(password: string) {
  // In a real app, use environment variables. 
  // For this simple request, we'll use a hardcoded simple password.
  return password === "admin123";
}

// --- News Actions ---

export async function getNews() {
  try {
    const db = await readDB();
    return db.news;
  } catch (error) {
    console.error("Error reading news:", error);
    return [];
  }
}

export async function addNewsItem(item: any) {
  try {
    const db = await readDB();
    
    // Assign a new ID (max + 1)
    const maxId = db.news.reduce((max: number, n: any) => Math.max(max, typeof n.id === 'number' ? n.id : 0), 0);
    
    const newItem: NewsItem = {
      ...item,
      id: maxId + 1,
      // Default styles if not provided
      categoryColor: item.categoryColor || "text-sky-600 bg-sky-50 border-sky-100",
      icon: item.icon || "TrendingUp",
      iconColor: item.iconColor || "text-sky-500",
      imageColor: item.imageColor || "bg-gradient-to-br from-sky-100 to-sky-50 dark:from-sky-950 dark:to-slate-900"
    };
    
    db.news.unshift(newItem); // Add to beginning
    
    await writeDB(db);
    revalidatePath("/"); // Revalidate homepage
    return { success: true };
  } catch (error) {
    console.error("Error adding news:", error);
    return { success: false, error: "Failed to save news item" };
  }
}

export async function deleteNewsItem(id: number | string) {
  try {
    const db = await readDB();
    db.news = db.news.filter((item) => String(item.id) !== String(id));
    await writeDB(db);
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
    const db = await readDB();
    return db.learning;
  } catch (error) {
    console.error("Error reading learning:", error);
    return [];
  }
}

export async function addLearningItem(item: any) {
  try {
    const db = await readDB();
    
    // Generate a simple ID if not present
    const newItem: LearningItem = { 
        ...item, 
        id: item.id || `custom-${Date.now()}`,
        // Set default colors if not provided
        color: item.color || "text-sky-500",
        bgColor: item.bgColor || "bg-sky-50 dark:bg-sky-950/30",
        borderColor: item.borderColor || "border-sky-100 dark:border-sky-900",
        icon: item.icon || "Sparkles"
    };
    
    db.learning.unshift(newItem);
    
    await writeDB(db);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error adding learning:", error);
    return { success: false, error: "Failed to save learning item" };
  }
}

export async function deleteLearningItem(id: string) {
  try {
    const db = await readDB();
    db.learning = db.learning.filter((item) => item.id !== id);
    await writeDB(db);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting learning:", error);
    return { success: false, error: "Failed to delete learning item" };
  }
}
