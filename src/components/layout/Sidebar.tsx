"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  LayoutGrid, 
  PenTool, 
  Image as ImageIcon, 
  Zap, 
  Settings, 
  LogOut,
  GraduationCap,
  Newspaper,
  Type
} from "lucide-react";

interface SidebarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  className?: string;
}

export function Sidebar({ activeCategory, onSelectCategory, className }: SidebarProps) {
  const categories = [
    {
      id: "recommended",
      label: "编辑推荐",
      icon: Sparkles,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      id: "tools",
      label: "常用 AI 工具",
      icon: LayoutGrid,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      id: "writing",
      label: "AI 写作",
      icon: Type,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      id: "image",
      label: "AI 绘图",
      icon: ImageIcon,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      id: "rewrite",
      label: "文案改写", // Keeping original functionality accessible
      icon: PenTool,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
    },
    {
      id: "learning",
      label: "提效神技", // Maps to AI Learning
      icon: Zap,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      id: "news",
      label: "AI 资讯", // Maps to AI News
      icon: Newspaper,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <aside className={cn("flex h-full flex-col border-r border-slate-200 bg-white/50 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/50", className)}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Multipost AI
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            发现
          </div>
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectCategory(item.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                activeCategory === item.id
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                activeCategory === item.id ? item.bg : "bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700"
              )}>
                <item.icon className={cn(
                  "h-4 w-4",
                  activeCategory === item.id ? item.color : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                )} />
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
          <Settings className="h-4 w-4" />
          <span>设置</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
          <LogOut className="h-4 w-4" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}
