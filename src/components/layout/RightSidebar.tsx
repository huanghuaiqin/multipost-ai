"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Zap, ExternalLink, Loader2 } from "lucide-react";
import { getNews } from "@/app/actions/admin";

interface NewsItem {
  id: string;
  title: string;
  // other fields ignored
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
}

export function RightSidebar() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [hotTools, setHotTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch News
        const newsData = await getNews();
        if (Array.isArray(newsData)) {
          setNews(newsData.slice(0, 5)); // Top 5 news
        }

        // Fetch Hot Tools (Simulating "Weekly Hot" by fetching tools marked as hot)
        // In a real app, we would sort by view count
        const toolsResponse = await fetch("/api/get-tools?isHot=true");
        if (toolsResponse.ok) {
          const toolsData = await toolsResponse.json();
          setHotTools(toolsData.slice(0, 4)); // Top 4 hot tools
        }
      } catch (error) {
        console.error("Failed to fetch sidebar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <aside className="hidden xl:flex w-80 flex-col gap-6 border-l border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-950/50 h-full overflow-y-auto">
      {/* AI News */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <TrendingUp className="h-4 w-4 text-rose-500" />
            AI 资讯
          </h3>
          <span className="text-xs text-slate-500 cursor-pointer hover:text-indigo-600">更多</span>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-3">
            {news.map((item, index) => (
              <div key={item.id} className="group flex cursor-pointer items-start justify-between gap-2">
                <span className="line-clamp-1 text-sm text-slate-600 group-hover:text-indigo-600 dark:text-slate-400 dark:group-hover:text-indigo-400">
                  {index + 1}. {item.title}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 py-2">暂无资讯</div>
        )}
      </div>

      {/* Weekly Hot Tools */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
            <Zap className="h-4 w-4 text-amber-500" />
            本周热门
          </h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : hotTools.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {hotTools.map((tool) => (
              <div 
                key={tool.id} 
                className="group flex cursor-pointer flex-col gap-1 rounded-lg bg-slate-50 p-3 transition-all hover:bg-indigo-50 hover:shadow-sm dark:bg-slate-800 dark:hover:bg-indigo-900/20"
                onClick={() => window.open(tool.url, "_blank")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{tool.icon}</span>
                  <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50 text-indigo-500" />
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">{tool.name}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{tool.description}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 py-2">暂无热门工具</div>
        )}
      </div>

      {/* Ad / Promo */}
      <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white shadow-lg">
        <h3 className="mb-2 font-bold">解锁 Pro 会员</h3>
        <p className="mb-4 text-sm text-indigo-100">
          获取无限 GPT-4 使用次数，专属 AI 绘图模型，以及更多高级功能。
        </p>
        <button className="w-full rounded-lg bg-white py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
          立即升级
        </button>
      </div>
    </aside>
  );
}
