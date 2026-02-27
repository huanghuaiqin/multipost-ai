"use client";

import { Newspaper, TrendingUp, Zap, Video, Calendar, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

import { getNews } from "@/app/actions/admin";
import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";

export function AiNewsView() {
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<any>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const data = await getNews();
        setNewsItems(data);
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const getIcon = (iconName: string) => {
    // @ts-expect-error Dynamic icon access
  return LucideIcons[iconName] || LucideIcons.Newspaper;
  };

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-8 items-center justify-center py-20">
        <LucideIcons.Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="text-slate-500">加载资讯中...</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="space-y-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-xs font-medium text-rose-700 shadow-sm backdrop-blur-sm dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200">
          <Newspaper className="h-3.5 w-3.5" />
          AI 前沿资讯
        </span>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          紧跟 AI 时代脉搏，洞察未来机遇
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          每日精选全球 AI 行业动态、产品发布、融资快讯和深度评论，助你时刻保持领先。
        </p>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {newsItems.map((item) => (
          <Card
            key={item.id}
            className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-md dark:hover:bg-slate-900/50"
            onClick={() => setSelectedNews(item)}
          >
            <CardContent className="p-0">
              <div className="flex flex-col gap-6 sm:flex-row">
                {/* 图片预览区 (使用 CSS 渐变和图标模拟) */}
                <div
                  className={cn(
                    "flex h-48 w-full shrink-0 items-center justify-center sm:h-auto sm:w-48 md:w-64",
                    item.imageColor
                  )}
                >
                  {(() => {
                    const IconComponent = getIcon(item.icon);
                    return <IconComponent className={cn("h-12 w-12 opacity-50", item.iconColor)} />;
                  })()}
                </div>

                {/* 内容区 */}
                <div className="flex flex-1 flex-col justify-between p-6 sm:pl-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-xs font-medium",
                          item.categoryColor
                        )}
                      >
                        {item.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold leading-tight text-slate-900 group-hover:text-sky-600 dark:text-slate-50 dark:group-hover:text-sky-400">
                      {item.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                      {item.summary}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-end sm:justify-start">
                    <Button
                      variant="link"
                      className="h-auto p-0 text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400"
                    >
                      阅读全文 <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        title={selectedNews?.title}
        className="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs font-medium",
                selectedNews?.categoryColor
              )}
            >
              {selectedNews?.category}
            </span>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {selectedNews?.date}
            </div>
          </div>
          
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              {selectedNews?.summary}
            </p>
            {/* If we have full content in the future, render it here */}
          </div>
        </div>
      </Modal>
    </div>
  );
}
