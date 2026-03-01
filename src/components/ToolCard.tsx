import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    url: string;
    isHot: boolean;
  };
  onClick?: () => void;
}

export function ToolCard({ tool, onClick }: ToolCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex items-start gap-4 rounded-xl border border-slate-200/50 bg-white/40 p-5 transition-all duration-300 cursor-pointer",
        "hover:-translate-y-1 hover:bg-white/60 hover:shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-purple-900/20",
        "dark:border-slate-800/50 dark:bg-slate-900/40 dark:hover:bg-slate-900/60",
        "backdrop-blur-md"
      )}
    >
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 text-3xl shadow-sm dark:from-indigo-950/30 dark:to-purple-950/30 group-hover:scale-110 transition-transform duration-300">
        {tool.icon}
      </div>
      
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 truncate pr-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {tool.name}
          </h3>
          <ExternalLink className="h-4 w-4 text-slate-400 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-indigo-500" />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-10 mb-3">
          {tool.description}
        </p>
        <div className="flex items-center gap-2">
           <span className="inline-flex items-center rounded-md bg-slate-100/80 px-2 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
            {tool.category}
          </span>
          {tool.isHot && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-600 dark:bg-amber-900/20 dark:text-amber-500 border border-amber-100 dark:border-amber-900/30">
              <span className="animate-pulse">🔥</span> 热门
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
