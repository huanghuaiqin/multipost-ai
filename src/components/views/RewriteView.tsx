"use client";

import { useEffect, useState, useActionState } from "react";
import {
  Sparkles,
  MessageCircle,
  Globe2,
  Activity,
  Clapperboard,
  Youtube,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { rewriteAction, type RewriteState } from "@/app/actions";

type StyleKey =
  | "xiaohongshu"
  | "xiaohongshu_video"
  | "weixin"
  | "tiktok"
  | "douyin"
  | "youtube";

type RewriteResult = {
  style: StyleKey;
  content: string;
};

const initialState: RewriteState = {
  results: [],
  error: null,
};

export interface RewriteViewProps {
  input: string;
  setInput: (value: string) => void;
}

export function RewriteView({ input, setInput }: RewriteViewProps) {
  const [state, formAction, pending] = useActionState<RewriteState, FormData>(
    rewriteAction,
    initialState,
  );
  const results = state.results as RewriteResult[];
  const error = state.error;
  const isLoading = pending;
  const [copiedStyle, setCopiedStyle] = useState<StyleKey | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [recentInputs, setRecentInputs] = useState<string[]>([]);
  const [typedContent, setTypedContent] = useState<Record<StyleKey, string>>({
    xiaohongshu: "",
    xiaohongshu_video: "",
    weixin: "",
    tiktok: "",
    douyin: "",
    youtube: "",
  });
  const [typingStates, setTypingStates] = useState<Record<StyleKey, boolean>>({
    xiaohongshu: false,
    xiaohongshu_video: false,
    weixin: false,
    tiktok: false,
    douyin: false,
    youtube: false,
  });
  const hasResults = results.length > 0;
  const RECENT_KEY = "mp_recent_rewrite";

  useEffect(() => {
    const styles: StyleKey[] = [
      "xiaohongshu",
      "xiaohongshu_video",
      "weixin",
      "tiktok",
      "douyin",
      "youtube",
    ];
    const timeouts: number[] = [];

    styles.forEach((style) => {
      const full = results.find((item) => item.style === style)?.content ?? "";

      if (!full) {
        setTypedContent((prev) => ({
          ...prev,
          [style]: "",
        }));
        setTypingStates((prev) => ({
          ...prev,
          [style]: false,
        }));
        return;
      }

      let currentIndex = 0;

      setTypedContent((prev) => ({
        ...prev,
        [style]: "",
      }));
      setTypingStates((prev) => ({
        ...prev,
        [style]: true,
      }));

      const step = () => {
        currentIndex += 1;

        setTypedContent((prev) => ({
          ...prev,
          [style]: full.slice(0, currentIndex),
        }));

        if (currentIndex < full.length) {
          const id = window.setTimeout(step, 18);
          timeouts.push(id);
        } else {
          setTypingStates((prev) => ({
            ...prev,
            [style]: false,
          }));
        }
      };

      step();
    });

    return () => {
      timeouts.forEach((id) => {
        if (id) {
          window.clearTimeout(id);
        }
      });
    };
  }, [results]);

  const getResultByStyle = (style: StyleKey) =>
    results.find((item) => item.style === style)?.content ?? "";

  const handleCopy = async (style: StyleKey) => {
    const content = getResultByStyle(style);

    if (!content || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(content);
    setCopiedStyle(style);
    setShowCopyToast(true);

    window.setTimeout(() => {
      setCopiedStyle((current) => (current === style ? null : current));
    }, 1500);

    window.setTimeout(() => {
      setShowCopyToast(false);
    }, 1600);
  };

  const handleCopyAll = async () => {
    const order: StyleKey[] = [
      "xiaohongshu",
      "douyin",
      "weixin",
      "xiaohongshu_video",
      "youtube",
      "tiktok",
    ];
    const title: Record<StyleKey, string> = {
      xiaohongshu: "【小红书】",
      douyin: "【抖音】",
      weixin: "【视频号】",
      xiaohongshu_video: "【小红书视频脚本】",
      youtube: "【YouTube】",
      tiktok: "【TikTok】",
    };
    const parts = order
      .map((s) => {
        const c = getResultByStyle(s);
        if (!c) return null;
        return `${title[s]}\n${c}`;
      })
      .filter(Boolean)
      .join("\n\n");
    if (!parts || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(parts);
    setShowCopyToast(true);
    window.setTimeout(() => {
      setShowCopyToast(false);
    }, 1600);
  };

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(RECENT_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) {
          setRecentInputs(parsed.slice(0, 3));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!hasResults) return;
    const val = (input || "").trim();
    if (!val) return;

    try {
      const raw = localStorage.getItem(RECENT_KEY);
      const prev = (raw ? JSON.parse(raw) : []) as string[];
      
      // If the latest input is already saved at the top, just sync state and return
      if (prev.length > 0 && prev[0] === val) {
        setRecentInputs(prev.slice(0, 3));
        return;
      }

      const next = [val, ...prev.filter((p: string) => p !== val)].slice(0, 3);
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      setRecentInputs(next);
    } catch {}
    // We only want to run this when results change (i.e. after a successful submission),
    // not when input changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="space-y-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
          内容搬运工 · Multipost AI
        </span>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          一段原始内容，一键改写为多平台多形态运营级文案
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          这是一个专注于「内容搬运」场景的原型工具。粘贴任意一段内容或链接，即可调用 AI 一键生成多平台风格的改写文案。
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,3fr)] lg:items-start">
        <Card className="border-sky-100/80 shadow-sm shadow-sky-100/60 dark:border-sky-900/70 dark:shadow-none">
          <CardHeader className="mb-3 flex flex-col items-start gap-2">
            <CardTitle className="inline-flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-sky-500" />
              原始内容
            </CardTitle>
            <CardDescription>
              支持粘贴微博、公众号、小红书链接，或直接输入一段草稿内容。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={formAction} className="space-y-4">
              <textarea
                name="input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="例如：我想发一条关于 AI 提升效率的内容，帮我生成适合多平台的版本。"
                className="min-h-[300px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/70 px-6 py-5 text-base leading-relaxed text-slate-900 outline-none ring-0 ring-sky-500/5 transition focus:border-sky-500 focus:bg-white focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:focus:border-sky-400"
              />
              {isLoading && (
                <div className="flex items-center gap-2 px-1 text-sm text-sky-600 dark:text-sky-400 animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>DeepSeek 正在为您改写中...</span>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  点击按钮后会调用 AI 实时改写内容，生成多平台风格的文案预览。
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading || !input}
                    onClick={() => {
                      setInput("");
                    }}
                  >
                    清空
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading || !input.trim()}
                  >
                    {isLoading ? "智能改写中…" : hasResults ? "再次改写" : "一键智能改写"}
                  </Button>
                </div>
              </div>
            </form>
            {recentInputs.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  最近记录
                </div>
                <div className="flex flex-col gap-2">
                  {recentInputs.map((r, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="inline-flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                      onClick={() => setInput(r)}
                      title={r}
                    >
                      <span className="line-clamp-1">
                        {r.length > 80 ? r.slice(0, 80) + "…" : r}
                      </span>
                      <span className="ml-3 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        填充
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              多平台预览
            </h2>
            {error ? (
              <p className="text-xs text-red-500 dark:text-red-400">
                {error}
              </p>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                点击按钮后展示 Skeleton Loading，约 3 秒填充样板文案。
              </p>
            )}
          </div>

          {/* 两行三列卡片布局 */}
          <div className="space-y-3">
            {/* 第一行卡片：小红书、抖音、视频号 */}
            <div className="grid gap-6 sm:grid-cols-3 lg:gap-8">
              <Card className="flex flex-col border-rose-100/80 bg-rose-50/70 p-10 shadow-sm shadow-rose-100/70 dark:border-rose-900/70 dark:bg-rose-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-rose-500" />
                    小红书风格
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between">
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="h-3 w-20 rounded-full bg-rose-100 animate-pulse dark:bg-rose-900/60" />
                      <div className="space-y-2">
                        <div className="h-2 w-full rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                        <div className="h-2 w-11/12 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                        <div className="h-2 w-10/12 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                      </div>
                    </div>
                  ) : getResultByStyle("xiaohongshu") ? (
                    <>
                      <p className="whitespace-pre-wrap text-sm leading-loose animate-[fade-in-up_0.35s_ease-out]">
                        {typedContent.xiaohongshu || getResultByStyle("xiaohongshu")}
                        {typingStates.xiaohongshu && (
                          <span className="typing-cursor align-middle" />
                        )}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy("xiaohongshu")}
                          className="h-8 gap-1 rounded-full px-3 text-xs text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/50"
                        >
                          {copiedStyle === "xiaohongshu" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          复制
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      偏情绪化+生活化，适合种草、复盘、宝藏分享，多用 Emoji 和「宝藏
                      / 干货 / 亲测」等关键词。
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="flex flex-col p-10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-fuchsia-500" />
                    抖音短视频
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between">
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="h-3 w-24 rounded-full bg-fuchsia-100 animate-pulse dark:bg-fuchsia-900/60" />
                      <div className="space-y-2">
                        <div className="h-2 w-full rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                        <div className="h-2 w-10/12 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                        <div className="h-2 w-8/12 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                      </div>
                    </div>
                  ) : getResultByStyle("douyin") ? (
                    <>
                      <p className="whitespace-pre-wrap text-sm leading-loose animate-[fade-in-up_0.35s_ease-out]">
                        {typedContent.douyin || getResultByStyle("douyin")}
                        {typingStates.douyin && (
                          <span className="typing-cursor align-middle" />
                        )}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy("douyin")}
                          className="h-8 gap-1 rounded-full px-3 text-xs text-fuchsia-600 hover:bg-fuchsia-100 hover:text-fuchsia-700 dark:text-fuchsia-400 dark:hover:bg-fuchsia-900/50"
                        >
                          {copiedStyle === "douyin" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          复制
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      更偏短视频脚本，节奏快、有梗，前 3 秒 Hook 强，适合抖音推荐流。
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="flex flex-col p-10">
                <CardHeader className="flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-500 px-4 py-3 text-emerald-50 shadow-sm dark:from-emerald-700 dark:via-emerald-700 dark:to-emerald-600">
                  <CardTitle className="flex items-center gap-2 text-emerald-50">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-100" />
                    </span>
                    <span>视频号风格</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between">
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="h-3 w-24 rounded-full bg-amber-100 animate-pulse dark:bg-amber-900/60" />
                      <div className="space-y-2">
                        <div className="h-2 w-full rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                        <div className="h-2 w-11/12 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                        <div className="h-2 w-9/12 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                      </div>
                    </div>
                  ) : getResultByStyle("weixin") ? (
                    <>
                      <p className="whitespace-pre-wrap text-sm leading-loose animate-[fade-in-up_0.35s_ease-out]">
                        {typedContent.weixin || getResultByStyle("weixin")}
                        {typingStates.weixin && (
                          <span className="typing-cursor align-middle" />
                        )}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy("weixin")}
                          className="h-8 gap-1 rounded-full px-3 text-xs text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                        >
                          {copiedStyle === "weixin" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          复制
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      语气克制、逻辑清晰，适合职场分享和社交圈转发，突出方法论和可落地
                      的价值点。
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 第二行卡片：小红书视频分镜、YouTube、TikTok */}
            <div className="grid gap-6 sm:grid-cols-3 lg:gap-8">
              <Card className="flex flex-col p-10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clapperboard className="h-4 w-4 text-rose-500" />
                    小红书视频脚本
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between">
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="h-3 w-24 rounded-full bg-rose-100 animate-pulse dark:bg-rose-900/60" />
                      <div className="space-y-2">
                        <div className="h-2 w-full rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                        <div className="h-2 w-11/12 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                        <div className="h-2 w-9/12 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                      </div>
                    </div>
                  ) : getResultByStyle("xiaohongshu_video") ? (
                    <>
                      <p className="whitespace-pre-wrap text-sm leading-loose animate-[fade-in-up_0.35s_ease-out]">
                        {typedContent.xiaohongshu_video || getResultByStyle("xiaohongshu_video")}
                        {typingStates.xiaohongshu_video && (
                          <span className="typing-cursor align-middle" />
                        )}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy("xiaohongshu_video")}
                          className="h-8 gap-1 rounded-full px-3 text-xs text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/50"
                        >
                          {copiedStyle === "xiaohongshu_video" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          复制
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      将同一主题拆成镜头脚本，每个镜头区分【视觉画面】和【口播文案】，方便拍摄。
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="flex flex-col p-10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-500" />
                    YouTube 风格
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between">
                  {isLoading ? (
                    <div className="space-y-3">
                      <div className="h-3 w-24 rounded-full bg-red-100 animate-pulse dark:bg-red-900/60" />
                      <div className="space-y-2">
                        <div className="h-2 w-full rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                        <div className="h-2 w-10/12 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                        <div className="h-2 w-8/12 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                      </div>
                    </div>
                  ) : getResultByStyle("youtube") ? (
                    <>
                      <p className="whitespace-pre-wrap text-sm leading-loose animate-[fade-in-up_0.35s_ease-out]">
                        {typedContent.youtube || getResultByStyle("youtube")}
                        {typingStates.youtube && (
                          <span className="typing-cursor align-middle" />
                        )}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy("youtube")}
                          className="h-8 gap-1 rounded-full px-3 text-xs text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/50"
                        >
                          {copiedStyle === "youtube" ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          复制
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      适合全球受众的英文长视频，突出标题 Hook 和信息密度，配合简介型文案。
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="rounded-2xl bg-[conic-gradient(from_140deg_at_10%_0%,#f97316,#22d3ee,#a855f7,#f97316)] p-[1px] shadow-[0_0_26px_rgba(56,189,248,0.45)]">
                <Card className="flex flex-col h-full rounded-[1rem] border-slate-900 bg-slate-950 text-slate-50 p-10">
                  <CardHeader className="flex items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-slate-50">
                      <Globe2 className="h-4 w-4 text-sky-400" />
                      <span>TikTok 国际版</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col justify-between">
                    {isLoading ? (
                      <div className="space-y-3">
                        <div className="h-3 w-28 rounded-full bg-sky-100 animate-pulse dark:bg-sky-900/60" />
                        <div className="space-y-2">
                          <div className="h-2 w-full rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                          <div className="h-2 w-10/12 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                          <div className="h-2 w-8/12 rounded bg-slate-200 animate-pulse dark:bg-slate-800" />
                        </div>
                      </div>
                    ) : getResultByStyle("tiktok") ? (
                      <>
                        <p className="whitespace-pre-wrap text-sm leading-loose animate-[fade-in-up_0.35s_ease-out]">
                          {typedContent.tiktok || getResultByStyle("tiktok")}
                          {typingStates.tiktok && (
                            <span className="typing-cursor align-middle" />
                          )}
                        </p>
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy("tiktok")}
                            className="h-8 gap-1 rounded-full px-3 text-xs text-sky-400 hover:bg-slate-800 hover:text-sky-300"
                          >
                            {copiedStyle === "tiktok" ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            复制
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400">
                        极简、高能量的口语化英文，强调 Hook、节奏感和可被记住的一句
                        话，适合短视频开头脚本。
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          {hasResults && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                onClick={handleCopyAll}
              >
                一键复制
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] dark:bg-slate-950/60 animate-[fade-in_0.3s_ease-out]">
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 animate-[zoom-in_0.3s_ease-out]">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-20"></span>
              <Loader2 className="relative h-8 w-8 animate-spin text-sky-500" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                AI 正在思考中...
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                DeepSeek 正在为您生成多平台文案
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Copy Success Toast */}
      {showCopyToast && (
        <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center px-4 animate-[fade-in_0.2s_ease-out]">
          <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-2xl border border-emerald-100 bg-white/95 p-6 shadow-2xl backdrop-blur-sm dark:border-emerald-900/50 dark:bg-slate-900/95 animate-[zoom-in_0.2s_ease-out]">
            <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
               <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                 复制成功
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                 快去发布吧！
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
