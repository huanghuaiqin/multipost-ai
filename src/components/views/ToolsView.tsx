"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ToolCard } from "@/components/ToolCard";
import { ToolModal } from "@/components/ToolModal";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  url: string;
  isHot: boolean;
  aiReview?: string;
}

interface ToolsViewProps {
  category?: string; // If provided, filter by category (e.g. "Image")
  isHot?: boolean;   // If true, filter by isHot
  title?: string;
}

export function ToolsView({ category, isHot, title = "常用 AI 工具" }: ToolsViewProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchTools = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (category) params.append("category", category);
        if (isHot) params.append("isHot", "true");

        const response = await fetch(`/api/get-tools?${params.toString()}`, {
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!isMounted) return;
        setTools(data);
      } catch (err) {
        if (!isMounted) return;
        console.error("ToolsView fetch error:", err);
        setError(err instanceof Error ? err.message : "无法加载工具数据，请稍后重试");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTools();

    return () => {
      isMounted = false;
    };
  }, [category, isHot]);

  if (loading && tools.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
          <LayoutGrid className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-slate-400" />}
        <span className="ml-auto text-sm text-slate-500">
          共 {tools.length} 个工具
        </span>
      </div>

      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ToolCard
                tool={tool}
                onClick={() => setSelectedTool(selectedTool?.id === tool.id ? null : tool)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {tools.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
          <p>暂无相关工具</p>
        </div>
      )}

      <ToolModal
        tool={selectedTool}
        isOpen={!!selectedTool}
        onClose={() => setSelectedTool(null)}
      />
    </div>
  );
}
