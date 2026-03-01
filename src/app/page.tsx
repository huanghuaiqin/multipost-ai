"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RewriteView } from "@/components/views/RewriteView";
import { AiLearningView } from "@/components/views/AiLearningView";
import { AiNewsView } from "@/components/views/AiNewsView";
import { RecommendedView } from "@/components/views/RecommendedView";
import { ToolsView } from "@/components/views/ToolsView";
import { Sidebar } from "@/components/layout/Sidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Construction } from "lucide-react";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("recommended");
  const [rewriteInput, setRewriteInput] = useState("");

  const renderContent = () => {
    switch (activeCategory) {
      case "recommended":
        return <RecommendedView />;
      case "tools":
        return <ToolsView isHot />;
      case "writing":
        return <ToolsView category="Writing" title="AI 写作工具" />;
      case "image":
        return <ToolsView category="Image" title="AI 绘图工具" />;
      case "rewrite":
        return (
          <RewriteView 
            input={rewriteInput}
            setInput={setRewriteInput}
          />
        );
      case "learning":
        return (
          <AiLearningView 
            onSelectPrompt={(prompt) => {
              setRewriteInput(prompt);
              setActiveCategory("rewrite");
            }}
          />
        );
      case "news":
        return <AiNewsView />;
      default:
        return (
          <RewriteView 
            input={rewriteInput}
            setInput={setRewriteInput}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Left Sidebar - Hidden on mobile */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar 
          activeCategory={activeCategory} 
          onSelectCategory={setActiveCategory} 
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 scroll-smooth">
          <div className="mx-auto flex max-w-7xl gap-6">
            {/* Center Content */}
            <div className="flex-1 min-w-0">
              {renderContent()}
            </div>

            {/* Right Sidebar - Hidden on smaller screens */}
            <div className="hidden xl:block flex-shrink-0">
              <RightSidebar />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation - Visible only on mobile */}
      <MobileNav 
        activeCategory={activeCategory} 
        onSelectCategory={setActiveCategory} 
      />
    </div>
  );
}
