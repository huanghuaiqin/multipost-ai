"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Globe, LayoutGrid, Sparkles, Command, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SearchEngine = "baidu" | "google" | "internal";

interface RecommendedTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
  reason: string;
}

export function Header() {
  const [searchEngine, setSearchEngine] = useState<SearchEngine>("internal");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedTool[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 800); // 800ms delay to wait for user to finish typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // AI Recommendation logic
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2 || searchEngine !== "internal") {
        setRecommendations([]);
        return;
      }

      setIsThinking(true);
      setShowRecommendations(true);
      
      try {
        const response = await fetch('/api/zhipu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: debouncedQuery,
            type: 'recommendation'
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.recommendations && Array.isArray(data.recommendations)) {
            setRecommendations(data.recommendations);
          }
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setIsThinking(false);
      }
    };

    fetchRecommendations();
  }, [debouncedQuery, searchEngine]);

  // Close recommendations when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowRecommendations(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchEngine === "baidu") {
      window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(searchQuery)}`, "_blank");
    } else if (searchEngine === "google") {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
    } else {
      console.log("Internal search:", searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex h-16 items-center px-4 md:px-6 gap-4">
        {/* Logo Area - Mobile Only (Desktop logo is in sidebar) */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Multipost AI
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-auto hidden md:block" ref={wrapperRef}>
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            
            <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
              <div className="flex items-center gap-1 p-1 rounded-md bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setSearchEngine("internal")}
                  className={cn(
                    "p-1 rounded text-xs font-medium transition-all",
                    searchEngine === "internal" 
                      ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400" 
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  )}
                  title="站内搜索"
                >
                  站内
                </button>
                <button
                  type="button"
                  onClick={() => setSearchEngine("baidu")}
                  className={cn(
                    "p-1 rounded text-xs font-medium transition-all",
                    searchEngine === "baidu" 
                      ? "bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400" 
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  )}
                  title="百度搜索"
                >
                  百度
                </button>
                <button
                  type="button"
                  onClick={() => setSearchEngine("google")}
                  className={cn(
                    "p-1 rounded text-xs font-medium transition-all",
                    searchEngine === "google" 
                      ? "bg-white text-red-500 shadow-sm dark:bg-slate-700 dark:text-red-400" 
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  )}
                  title="Google"
                >
                  G
                </button>
              </div>
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!showRecommendations && e.target.value.length > 1) setShowRecommendations(true);
              }}
              onFocus={() => {
                if (recommendations.length > 0) setShowRecommendations(true);
              }}
              placeholder="输入需求，如：'我想做个视频'，AI 为你推荐工具..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-32 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900/50 dark:focus:bg-slate-950"
            />
          </form>

          {/* AI Recommendation Popup */}
          {showRecommendations && (isThinking || recommendations.length > 0) && searchEngine === "internal" && (
            <div className="absolute top-full left-0 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white/90 p-2 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 dark:border-slate-800 dark:bg-slate-950/90">
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-500">
                <Sparkles className="h-3.5 w-3.5" />
                AI 智能推荐
                {isThinking && <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-slate-400" />}
              </div>
              
              <div className="space-y-1">
                {isThinking && recommendations.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-slate-500">
                    正在分析您的需求...
                  </div>
                ) : (
                  recommendations.map((tool) => (
                    <a
                      key={tool.id}
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 rounded-lg p-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xl shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
                        {tool.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {tool.name}
                          </h4>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-indigo-500" />
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 dark:text-slate-400">
                          {tool.description}
                        </p>
                        <div className="mt-1.5 inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                          <Sparkles className="mr-1 h-3 w-3" />
                          {tool.reason}
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon" className="hidden md:flex text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50">
            <Globe className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden text-slate-500">
            <Search className="h-5 w-5" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium text-sm">
            M
          </div>
        </div>
      </div>
    </header>
  );
}
