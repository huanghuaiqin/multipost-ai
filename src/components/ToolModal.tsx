"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, Sparkles, Globe, Tag, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string | React.ReactNode;
  category: string;
  url: string;
  isHot: boolean;
  aiReview?: string;
}

interface ToolModalProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ToolModal({ tool, isOpen, onClose }: ToolModalProps) {
  const [aiReview, setAiReview] = useState<string>("");
  const [loadingReview, setLoadingReview] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    
    if (isOpen && tool) {
      setAiReview(tool.aiReview || "");
      if (!tool.aiReview) {
        generateAiReview(tool, controller.signal);
      }
    }
    
    return () => {
      controller.abort();
    };
  }, [isOpen, tool]);

  const generateAiReview = async (tool: Tool, signal: AbortSignal) => {
    setLoadingReview(true);
    try {
      const response = await fetch("/api/zhipu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `请用一句话简短评测 AI 工具 "${tool.name}" (${tool.description})。要求：客观、犀利、突出核心亮点，50字以内。`,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate review: ${response.status} ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setAiReview((prev) => prev + chunk);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('AI review generation aborted');
        return;
      }
      console.error("Failed to generate AI review:", error);
      setAiReview("AI 评测生成失败，请稍后重试。");
    } finally {
      if (!signal.aborted) {
        setLoadingReview(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && tool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm dark:bg-slate-950/40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/70"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center p-8 pb-6 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-lg dark:bg-slate-800 text-4xl">
                {tool.icon}
              </div>
              <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {tool.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Tag className="h-3 w-3" />
                  {tool.category}
                </span>
                {tool.isHot && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    🔥 热门
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-8 pb-8 space-y-6">
              {/* Description */}
              <div className="rounded-xl bg-slate-50/50 p-4 dark:bg-slate-950/30">
                <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {tool.description}
                  </ReactMarkdown>
                </div>
              </div>

              {/* AI Review */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-4 w-4" />
                  AI 一句话评测
                </div>
                <div className="min-h-[3rem] text-sm text-slate-700 dark:text-slate-300">
                  {loadingReview && !aiReview ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="animate-pulse">正在生成评测...</span>
                    </div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiReview}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Button
                className="w-full h-12 text-base shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all"
                onClick={() => window.open(tool.url, "_blank")}
              >
                <Globe className="mr-2 h-5 w-5" />
                访问官方网站
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
