"use client";

import { Sparkles, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function RecommendedView() {
  const recommendations = [
    {
      title: "GPT-4o",
      description: "OpenAI 最新的旗舰模型，支持实时语音、视频交互，能力全面升级。",
      tag: "大语言模型",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Midjourney V6",
      description: "最强 AI 绘图工具，V6 版本在光影、细节和文字渲染上有了质的飞跃。",
      tag: "图像生成",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Claude 3.5 Sonnet",
      description: "Anthropic 推出的强力模型，代码能力和逻辑推理表现优异，超越 GPT-4。",
      tag: "生产力",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Sora",
      description: "OpenAI 的视频生成模型，能够生成长达一分钟的高清视频，震撼业界。",
      tag: "视频生成",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">编辑推荐</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {recommendations.map((item, index) => (
          <Card key={index} className="group overflow-hidden transition-all hover:shadow-md dark:hover:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {item.tag}
                </span>
              </div>
              <CardTitle className="mt-3 text-lg text-slate-900 dark:text-slate-100">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-2 mb-4 text-slate-500 dark:text-slate-400">
                {item.description}
              </CardDescription>
              <Button variant="outline" className="w-full group-hover:border-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                查看详情 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
