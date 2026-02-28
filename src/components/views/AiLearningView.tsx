"use client";

import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Video, TrendingUp, Copy, ArrowRight, UserCog, Wrench, Loader2, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getLearning, getLearningItem } from "@/app/actions/admin";
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
  content: string; // Content is stored as a string (Markdown or JSON) in DB
  createdAt?: Date;
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
          icon: (LucideIcons as any)[item.icon] || LucideIcons.BookOpen,
          // Ensure createdAt is a Date object if it's a string from JSON/API
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
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
  const [modalContent, setModalContent] = useState<LearningCard | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      if (!selectedCardId) {
        setModalContent(null);
        return;
      }

      setLoadingContent(true);
      try {
        const item = await getLearningItem(selectedCardId);
        if (item) {
          // Process item similar to list
          const processed: LearningCard = {
            ...item,
            color: item.color || "",
            bgColor: item.bgColor || "",
            borderColor: item.borderColor || "",
            icon: (LucideIcons as any)[item.icon || "BookOpen"] || LucideIcons.BookOpen,
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
          };
          setModalContent(processed);
        }
      } catch (error) {
        console.error("Failed to fetch learning item details:", error);
      } finally {
        setLoadingContent(false);
      }
    }

    fetchDetails();
  }, [selectedCardId]);

  const filteredCards = activeTab === "全部" 
    ? learningCards 
    : learningCards.filter(card => {
        if (activeTab === "AI 软件") return card.category === "软件推荐";
        if (activeTab === "使用教程") return card.category === "使用教程";
        if (activeTab === "学习资料") return card.category === "学习资料";
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
  const displayItem = modalContent || selectedCard;

  // Helper to parse content
  let parsedContent: any = null;
  let isJsonContent = false;
  
  if (displayItem) {
    try {
      // Try to parse as JSON for legacy/special cards
      if (displayItem.content && displayItem.content.trim().startsWith('{')) {
        parsedContent = JSON.parse(displayItem.content);
        isJsonContent = true;
      }
    } catch (e) {
      // Not JSON, treat as Markdown string
      isJsonContent = false;
    }
  }

  const modalTitle = isJsonContent ? parsedContent?.title : displayItem?.title;
  const modalContentText = isJsonContent ? (parsedContent?.text || "") : (displayItem?.content || "");
  const modalItems = isJsonContent ? parsedContent?.items : null;

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
          {["全部", "AI 软件", "使用教程", "学习资料"].map((tab) => (
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

      {filteredCards.length > 0 ? (
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
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
          <div className="mb-4 rounded-full bg-slate-100 p-6 dark:bg-slate-800">
            <Sparkles className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-50">
            内容正在准备中
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            我们正在为您精心制作该分类下的优质内容，敬请期待！
          </p>
        </div>
      )}

      <Modal
        isOpen={!!selectedCardId}
        onClose={() => setSelectedCardId(null)}
        title={modalTitle}
        className="max-w-3xl"
      >
        {loadingContent ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            <p className="mt-2 text-slate-500">加载详情中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayItem?.createdAt && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="rounded-full border px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {displayItem.category}
                </span>
                <span>•</span>
                <span>{displayItem.createdAt.toLocaleDateString()}</span>
              </div>
            )}
            
            {modalItems ? (
              <div className="grid gap-4 sm:grid-cols-2">
              {modalItems.map((item: any, idx: number) => (
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
                  {modalContentText}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
