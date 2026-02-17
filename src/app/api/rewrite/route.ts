import OpenAI from "openai";
import { NextResponse } from "next/server";

type StyleKey = "xiaohongshu" | "weixin" | "tiktok";

type RewriteResult = {
  style: StyleKey;
  content: string;
};

const FALLBACK_MOCK_RESULTS: Record<StyleKey, string> = {
  xiaohongshu:
    "姐妹们！！真的挖到一个宝藏好物✨\n\n这次不是营销号，是我自己亲测后的真实感受～\n从效率、体验到细节，都充满干货，完全值得收藏反复翻看。\n\n如果你也在为「写不出好文案」「不知道怎么发小红书」犯愁，这个思路一定要学会，真的会越用越顺手！💕",
  weixin:
    "这是一套围绕「一份内容，多端分发」设计的实用工作流。\n\n它的核心价值在于：在不牺牲表达质量的前提下，大幅降低多平台运营的时间成本，同时保持品牌调性的一致性。\n\n无论是职场个人 IP、企业内容号，还是社交圈的专业分享，都可以借助这套方法实现更高效、更稳定的输出。",
  tiktok:
    "One idea. Three platforms. Zero extra headache.\n\nShort. Punchy. Scroll-stopping.\nTurn your rough draft into content that actually gets watched, saved, and shared.",
};

const styleInstruction: Record<StyleKey, string> = {
  xiaohongshu:
    "用中文改写下面的内容，适配小红书笔记风格。要求：语气亲切、第一人称、适度夸张但真诚，多使用 Emoji，且自然出现「宝藏」「干货」「亲测」等关键词。只输出改写后的正文，不要分析，不要加标题。",
  weixin:
    "用中文改写下面的内容，适配微信视频号/朋友圈分享风格。要求：语气专业、客观，逻辑清晰，突出方法论与可落地的价值，适合职场人转发。只输出改写后的正文，不要分析，不要加标题。",
  tiktok:
    "Use natural, energetic spoken English to rewrite the content for a TikTok-style short video hook and caption. Be short, punchy, and rhythmic. Avoid hashtags and meta commentary. Output English only.",
};

const apiKey = process.env.DEEPSEEK_API_KEY;

const openai =
  apiKey &&
  new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
  });

async function callDeepseek(style: StyleKey, input: string): Promise<string> {
  if (!openai) {
    const trimmed = input.trim();
    const base = FALLBACK_MOCK_RESULTS[style];

    if (!trimmed) {
      return base;
    }

    const snippet = trimmed.slice(0, 80);

    return `${base}\n\n原始内容片段：${snippet}${trimmed.length > 80 ? "..." : ""}`;
  }

  const completion = await openai.chat.completions.create({
    model: "deepseek-chat",
    temperature: 0.8,
    messages: [
      {
        role: "system",
        content: styleInstruction[style],
      },
      {
        role: "user",
        content:
          input.trim() ||
          "请自行构造一段适合作为案例演示的通用内容，主题是「使用 AI 帮助创作者在多个平台高效分发内容」。",
      },
    ],
  });

  const content =
    completion.choices[0]?.message?.content?.toString().trim() ?? "";

  return content;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = typeof body.input === "string" ? body.input : "";

    const styles: StyleKey[] = ["xiaohongshu", "weixin", "tiktok"];

    const results: RewriteResult[] = [];

    for (const style of styles) {
      const content = await callDeepseek(style, input);
      results.push({ style, content });
    }

    return NextResponse.json({
      results,
      fromMock: !process.env.DEEPSEEK_API_KEY,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "调用 DeepSeek 接口失败，请稍后重试或检查服务配置。",
      },
      { status: 500 },
    );
  }
}
