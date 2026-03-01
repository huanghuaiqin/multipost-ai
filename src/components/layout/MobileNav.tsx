"use client";

import { cn } from "@/lib/utils";
import { Sparkles, LayoutGrid, PenTool, Zap, User } from "lucide-react";

interface MobileNavProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export function MobileNav({ activeCategory, onSelectCategory }: MobileNavProps) {
  const items = [
    {
      id: "recommended",
      label: "推荐",
      icon: Sparkles,
    },
    {
      id: "tools",
      label: "工具",
      icon: LayoutGrid,
    },
    {
      id: "rewrite",
      label: "改写",
      icon: PenTool,
    },
    {
      id: "learning",
      label: "学习",
      icon: Zap,
    },
    {
      id: "profile",
      label: "我的",
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/80 px-6 pb-6 pt-2 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80 md:hidden">
      <div className="flex justify-between">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectCategory(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-2 py-1 transition-all",
              activeCategory === item.id
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            )}
          >
            <item.icon className={cn("h-6 w-6", activeCategory === item.id && "fill-current")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
