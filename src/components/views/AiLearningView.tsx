"use client";

import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Video, TrendingUp, Copy, ArrowRight, UserCog, Wrench, Loader2, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getLearning } from "@/app/actions/admin";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

export interface AiLearningViewProps {
  onSelectPrompt?: (prompt: string) => void;
}

interface LearningCard {
  id: string;
  title: string;
  icon: any; // Changed from LucideIcon to any to avoid type issues with dynamic import
  color: string;
  bgColor: string;
  borderColor: string;
  desc: string;
  category: string;
  content: {
    title: string;
    items?: {
      label: string;
      prompt: string;
    }[];
    text?: string;
  };
}

export function AiLearningView({ onSelectPrompt }: AiLearningViewProps) {
  const [learningCards, setLearningCards] = useState<LearningCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("全部");

  useEffect(() => {
    async function fetchLearning() {
      try {
        const data = await getLearning();
        const processed = data.map((item: any) => ({
          ...item,
          icon: (LucideIcons as any)[item.icon] || LucideIcons.BookOpen
        }));
        setLearningCards(processed);
      } catch (error) {
        console.error("Failed to fetch learning data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLearning();
  }, []);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const filteredCards = activeTab === "全部" 
    ? learningCards 
    : learningCards.filter(card => {
        // Map frontend tabs to backend categories if needed, or use exact match
        // '教程' -> '使用教程'
        // '软件' -> '软件推荐'
        // '资料' -> '学习资料'
        if (activeTab === "教程") return card.category === "使用教程";
        if (activeTab === "软件") return card.category === "软件推荐";
        if (activeTab === "资料") return card.category === "学习资料";
        return card.category === activeTab;
      });

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-8 items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="text-slate-500">加载学习内容中...</p>
      </div>
    );
  }

  const selectedCard = learningCards.find(c => c.id === selectedCardId);

  const handleUsePrompt = (prompt: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(prompt);
      setSelectedCardId(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="space-y-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm backdrop-blur-sm dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200">
          <BookOpen className="h-3.5 w-3.5" />
          AI 学习中心
        </span>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          掌握 AI 核心技能，成为超级个体
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          这里汇集了实用的文案公式、选题技巧以及 Prompt 编写指南，助你快速上手。
        </p>
      </header>

      {/* Category Tabs */}
      <div className="flex justify-center w-full">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {["全部", "教程", "软件", "资料"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
                activeTab === tab
                  ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50"
                  : "hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCards.map((card) => (
          <Card
            key={card.id}
            className={cn(
              "group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-none dark:hover:bg-slate-900/50",
              card.borderColor
            )}
            onClick={() => setSelectedCardId(card.id)}
          >
            <CardHeader>
              <div className={cn("mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl", card.bgColor)}>
                <card.icon className={cn("h-6 w-6", card.color)} />
              </div>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {card.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {card.desc}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!selectedCardId}
        onClose={() => setSelectedCardId(null)}
        title={selectedCard?.content.title}
        className="max-w-3xl"
      >
        {selectedCard?.id === "xhs-prompt" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {selectedCard.content.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900"
              >
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100">
                    {item.label}
                  </h3>
                  <p className="line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
                    {item.prompt}
                  </p>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => handleUsePrompt(item.prompt)}
                  >
                    <Copy className="h-3 w-3" />
                    去改写
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {selectedCard?.content.text || ""}
            </ReactMarkdown>
          </div>
        )}
      </Modal>
    </div>
  );
}
