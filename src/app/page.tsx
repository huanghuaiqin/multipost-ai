"use client";

import { useState } from "react";
import { PenTool, GraduationCap, Newspaper, Menu, X, Coffee, MessageSquare, Send, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RewriteView } from "@/components/views/RewriteView";
import { AiLearningView } from "@/components/views/AiLearningView";
import { AiNewsView } from "@/components/views/AiNewsView";
import { Modal } from "@/components/ui/modal";

type ViewType = "rewrite" | "learning" | "news";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("rewrite");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rewriteInput, setRewriteInput] = useState("");
  const [showDonateQR, setShowDonateQR] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const menuItems = [
    {
      id: "rewrite",
      label: "文案改写",
      icon: PenTool,
    },
    {
      id: "learning",
      label: "AI 学习",
      icon: GraduationCap,
    },
    {
      id: "news",
      label: "AI 资讯",
      icon: Newspaper,
    },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-sky-50 via-slate-50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-slate-200 bg-white/80 p-6 backdrop-blur-sm transition-transform duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-950/80 lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="mb-8 flex items-center justify-between lg:justify-center">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-50">
              Multipost AI
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  activeView === item.id
                    ? "bg-sky-100 text-sky-900 dark:bg-sky-900/30 dark:text-sky-100"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
              onClick={() => setShowDonateQR(true)}
            >
              <Coffee className="h-4 w-4" />
              赞赏作者
            </Button>
            
            <div className="flex items-center justify-between px-1">
              <Button
                variant="ghost"
                size="sm"
                aria-label="关于"
                className="h-8 gap-1.5 px-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
                onClick={() => setShowAbout(true)}
              >
                <Info className="h-3.5 w-3.5" />
                <span className="text-xs">关于</span>
              </Button>
              <div className="text-xs text-slate-400 dark:text-slate-500">
                v1.0.0
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8">
          {/* Mobile Header */}
          <div className="mb-6 flex items-center lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <span className="ml-2 font-semibold text-slate-900 dark:text-slate-50">
              Multipost AI
            </span>
          </div>

          <div className="mx-auto max-w-[1400px]">
            {activeView === "rewrite" && (
              <RewriteView 
                input={rewriteInput}
                setInput={setRewriteInput}
              />
            )}
            {activeView === "learning" && (
              <AiLearningView 
                onSelectPrompt={(prompt) => {
                  setRewriteInput(prompt);
                  setActiveView("rewrite");
                }}
              />
            )}
            {activeView === "news" && <AiNewsView />}
          </div>
        </div>
      </main>

      <Modal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        title="关于 Multipost AI"
      >
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Multipost AI 是一个专门为<strong className="font-semibold text-sky-600 dark:text-sky-400">自媒体人</strong>设计的 AI 提效工具。
          </p>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            无论你是需要小红书的种草文案、抖音的短视频脚本，还是视频号的职场分享，只需输入一段内容，即可一键生成适配多平台的优质文案，助你轻松实现全网分发。
          </p>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
              联系作者：<span className="font-medium text-slate-700 dark:text-slate-200">wx_id_123456</span> (欢迎反馈建议)
            </p>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDonateQR}
        onClose={() => setShowDonateQR(false)}
        title="请作者喝咖啡"
      >
        <div className="space-y-4">
          <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/my-qr-code.png" 
              alt="赞赏二维码" 
              className="h-full w-full object-contain"
            />
          </div>
          <p className="text-center text-sm font-medium text-slate-700 dark:text-slate-200">
            您的支持是 Multipost AI 进化的原动力
          </p>
        </div>
      </Modal>

      {/* Floating Feedback Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {showFeedback && (
          <div className="w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-bottom-2 dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">给我们提建议</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 rounded-full p-0"
                onClick={() => setShowFeedback(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <textarea
              className="mb-3 min-h-[100px] w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50"
              placeholder="功能建议、Bug 反馈或只是想聊聊..."
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                微信号: wx_id_123456
              </span>
              <Button size="sm" className="gap-2 bg-sky-600 hover:bg-sky-700 text-white">
                <Send className="h-3 w-3" />
                发送
              </Button>
            </div>
          </div>
        )}
        <Button
          size="lg"
          className="h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-105 bg-sky-600 hover:bg-sky-700 text-white"
          onClick={() => setShowFeedback(!showFeedback)}
        >
          {showFeedback ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
