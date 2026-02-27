"use client";

import { useState, useEffect } from "react";
import { BookOpen, Sparkles, Video, TrendingUp, Copy, ArrowRight, UserCog, Wrench, Loader2, LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
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
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  desc: string;
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {learningCards.map((card) => (
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
            {selectedCard?.content.text?.split('\n').map((line, i) => {
              if (line.startsWith('### ')) {
                return <h3 key={i} className="mt-6 mb-3 text-lg font-bold text-slate-900 dark:text-slate-100">{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('- **')) {
                const parts = line.split('**');
                return (
                  <li key={i} className="ml-4 list-disc text-sm leading-7 text-slate-600 dark:text-slate-300">
                    <strong className="font-semibold text-slate-800 dark:text-slate-200">{parts[1]}</strong>
                    {parts[2]}
                  </li>
                );
              }
               if (line.startsWith('**Prompt 示例**')) {
                return <p key={i} className="mt-4 mb-2 font-semibold text-slate-800 dark:text-slate-200">{line}</p>;
              }
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="mb-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{line}</p>;
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
