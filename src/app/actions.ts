"use server";

import OpenAI from "openai";

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

export type RewriteState = {
  results: RewriteResult[];
  error?: string | null;
};

type XiaohongshuVideoScene = {
  visual?: unknown;
  voiceover?: unknown;
};

type PlatformStructuredResult = {
  xiaohongshu?: {
    title?: string;
    body?: string;
    hashtags?: string[];
    video_script?: {
      scenes?: XiaohongshuVideoScene[];
    };
  };
  weixin?: {
    title?: string;
    body?: string;
  };
  tiktok?: {
    title?: string;
    body?: string;
  };
  douyin?: {
    title?: string;
    body?: string;
    video_script?: {
      scenes?: XiaohongshuVideoScene[];
    };
  };
  youtube?: {
    title?: string;
    body?: string;
  };
};

const initialState: RewriteState = {
  results: [],
  error: null,
};

const apiKey = process.env.DEEPSEEK_API_KEY;

const openai =
  apiKey &&
  new OpenAI({
    apiKey,
    baseURL: "https://api.deepseek.com",
  });

function parseJsonFromModel(content: string): PlatformStructuredResult | null {
  let text = content.trim();

  try {
    return JSON.parse(text) as PlatformStructuredResult;
  } catch {
  }

  text = text.replace(/```json/gi, "```").trim();

  if (text.startsWith("```") && text.endsWith("```")) {
    const inner = text.slice(3, -3).trim();

    try {
      return JSON.parse(inner) as PlatformStructuredResult;
    } catch {
    }
  }

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first !== -1 && last !== -1 && last > first) {
    const inner = text.slice(first, last + 1);

    try {
      return JSON.parse(inner) as PlatformStructuredResult;
    } catch {
    }
  }

  return null;
}

function extractBlockForKey(source: string, key: string): string | null {
  const keyToken = `"${key}"`;
  const keyIndex = source.indexOf(keyToken);

  if (keyIndex === -1) {
    return null;
  }

  const startBraceIndex = source.indexOf("{", keyIndex);

  if (startBraceIndex === -1) {
    return null;
  }

  let depth = 0;

  for (let index = startBraceIndex; index < source.length; index += 1) {
    const character = source[index];

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return source.slice(startBraceIndex, index + 1);
      }
    }
  }

  return null;
}

function extractStringField(block: string, field: string): string {
  const pattern = new RegExp(`"${field}"\\s*:\\s*"(.*?)"`, "s");
  const match = block.match(pattern);

  return match?.[1]?.trim() ?? "";
}

function extractStringArrayField(block: string, field: string): string[] {
  const pattern = new RegExp(`"${field}"\\s*:\\s*\\[(.*?)\\]`, "s");
  const match = block.match(pattern);

  if (!match?.[1]) {
    return [];
  }

  const raw = match[1];

  return raw
    .split(",")
    .map((item) => item.trim())
    .map((item) => item.replace(/^"+|"+$/g, "").trim())
    .filter((item) => item.length > 0);
}

function extractStructuredResultFromText(
  content: string,
): PlatformStructuredResult | null {
  const next: PlatformStructuredResult = {};

  const xhsBlock = extractBlockForKey(content, "xiaohongshu");
  if (xhsBlock) {
    next.xiaohongshu = {
      title: extractStringField(xhsBlock, "title"),
      body: extractStringField(xhsBlock, "body"),
      hashtags: extractStringArrayField(xhsBlock, "hashtags"),
    };
  }

  const weixinBlock = extractBlockForKey(content, "weixin");
  if (weixinBlock) {
    next.weixin = {
      title: extractStringField(weixinBlock, "title"),
      body: extractStringField(weixinBlock, "body"),
    };
  }

  const tiktokBlock = extractBlockForKey(content, "tiktok");
  if (tiktokBlock) {
    next.tiktok = {
      title: extractStringField(tiktokBlock, "title"),
      body: extractStringField(tiktokBlock, "body"),
    };
  }
  const douyinBlock = extractBlockForKey(content, "douyin");
  if (douyinBlock) {
    next.douyin = {
      title: extractStringField(douyinBlock, "title"),
      body: extractStringField(douyinBlock, "body"),
    };
  }
  const youtubeBlock = extractBlockForKey(content, "youtube");
  if (youtubeBlock) {
    next.youtube = {
      title: extractStringField(youtubeBlock, "title"),
      body: extractStringField(youtubeBlock, "body"),
    };
  }

  if (
    !next.xiaohongshu &&
    !next.weixin &&
    !next.tiktok &&
    !next.douyin &&
    !next.youtube
  ) {
    return null;
  }

  return next;
}

const systemPrompt =
  "你是一名拥有至少 5 年经验的全平台资深新媒体运营专家，深度熟悉小红书、微信视频号、抖音、TikTok 与 YouTube 等平台的内容风格与算法偏好。" +
  "你的任务是：根据用户提供的原始内容，为小红书图文、小红书视频脚本、微信视频号、TikTok、抖音和 YouTube 生成高度适配的改写文案，并严格按照指定的 JSON 结构返回结果。" +
  "必须注意：只允许输出 JSON，不要包含任何额外说明、提示语或非 JSON 文本。" +
  "返回格式（必须可以被 JSON.parse 直接解析）为：" +
  '{' +
  '"xiaohongshu": {' +
  '"title": "标题",' +
  '"body": "正文",' +
  '"hashtags": ["#话题1", "#话题2", "#话题3", "#话题4", "#话题5"],' +
  '"video_script": {' +
  '"scenes": [' +
  '{"visual": "第一镜头的视觉画面建议", "voiceover": "第一镜头的口播文案"},' +
  '{"visual": "第二镜头的视觉画面建议", "voiceover": "第二镜头的口播文案"}' +
  "]" +
  "}" +
  "}," +
  '"weixin": {"title": "标题", "body": "正文"},' +
  '"tiktok": {"title": "Title", "body": "Body"},' +
  '"douyin": {"title": "标题", "body": "正文", "video_script": {"scenes": []}},' +
  '"youtube": {"title": "Title", "body": "Body"}' +
  "}" +
  "具体风格要求如下：" +
  "1）小红书（xiaohongshu）：" +
  " - 角色：闺蜜式安利 / 真诚分享的创作者。" +
  " - 标题：要有强烈视觉冲击力和情绪张力，可以使用符号、数字、反差表达等方式实现「语不惊人死不休」，并且建议自然融入「狠狠心动」「谁懂啊」等小红书用户真实常用的表达，避免空洞的营销话术。" +
  " - 正文：多使用 Emoji（例如 ✨、💡、🎀 等），语气亲密、有画面感，像真人在分享「亲测好用」的宝藏心得，突出具体细节与真实感受；整篇正文中建议插入 5~8 个恰当的 Emoji，分布在不同句子中，而不是集中堆在一句话里。" +
  " - 严禁使用诸如「在这个快节奏的时代」「随着时代的发展」等陈词滥调和模板化句子，尽量用新鲜、有画面感的表达。" +
  " - 结尾：必须输出 5 个与内容垂直领域高度相关的热门话题标签（以 # 开头，放入 hashtags 数组），例如「#效率工具」「#职场成长」等，不要泛泛而谈。" +
  " - 同时，请在 xiaohongshu.video_script.scenes 字段中，为同一主题生成一个适合小红书视频的分镜头脚本；每个场景对象需包含 visual（视觉画面建议）和 voiceover（口播文案），语言风格与图文保持一致但更适合口播节奏。" +
  " - 脚本模式必须让用户一眼看出「画面」和「台词」的区别：请确保每个场景的 visual 与 voiceover 内容尽量简洁，适合作为字幕朗读，系统会在最终展示时为你自动加上【视觉画面】和【口播文案】等分段符号。" +
  "2）视频号（weixin）：" +
  " - 角色：稳重、专业的内容创作者或职场教练，面向「职场精英人群」做深度分享。" +
  " - 标题：稳重但有记忆点，兼顾专业感与吸引力，适合职场人士在朋友圈或同事群中转发。" +
  " - 正文：建议采用「背景 -> 痛点 -> 金句与解法」的清晰结构，并用「一、」「二、」「三、」等编号形式拆解主要观点：先交代场景与背景，再点出用户的真实痛点，最后给出一两句高度凝练的金句和可执行的行动建议。" +
  " - 结尾部分请增加 1 句简短的互动式提问，引导读者在评论区分享观点或转发给同事，例如询问他们是否有类似经历、是否已经踩过类似坑等。" +
  " - 语言：逻辑清晰、专业克制，尽量减少空洞形容词，用具体场景、步骤和对比增强说服力，适合被截图或转述给他人。" +
  "3）TikTok（tiktok）：" +
  " - 输出语言：主要使用自然、地道的英文表达，不要机械地逐句中译英；如需要中文，仅可少量作为括注或补充说明，英文部分必须完全独立可读。" +
  " - 标题（title）：第一句必须是强力 Hook，优先使用地道英文的反问句或极简有力短句（例如「You really still do it this way?」这类形式），让用户在前 3 秒就有继续看的冲动。" +
  " - 正文（body）：使用极简、地道的英文俚语和口语表达，句子短促、有节奏，适合配合快节奏短视频节奏，可以通过分行来营造停顿感和强调重点；避免像作文那样长句堆砌。" +
  " - 风格：避免堆砌长段文案和生硬的教学语气，可以适度加入 1~3 个英文 Hashtag，但不要将 Hashtag 作为主要内容载体。" +
  "4）抖音（douyin）：" +
  " - 语言：使用轻松、幽默、有梗的中文表达，可以合理引用网络热梗和弹幕口吻，但避免低俗或攻击性内容。" +
  " - 标题（title）：必须带有强烈悬念感或反差感，适合做封面大标题，让人「不点进去就难受」；避免空泛的励志口号。" +
  " - 正文（body）：文案必须极其精简，适合作为视频字幕使用，每一句长度控制在短短一行内，保证读完不费力；尽量用分行控制节奏，突出前 3 秒的 Hook。" +
  " - 内容：适合用作竖屏视频脚本或屏幕字幕，突出冲突、反转或强共鸣点，让观众愿意停留和看完。不要写成长篇大论的段落。" +
  " - 同时，请在 douyin.video_script.scenes 字段中，为抖音生成一个分镜头脚本；每个场景对象同样包含 visual（画面）与 voiceover（台词），语言更有节奏感，适合快节奏剪辑。" +
  "5）YouTube（youtube）：" +
  " - 语言：以自然、地道的英文为主，可以兼具信息量与亲和力，避免中式英语和堆砌长难句。" +
  " - 标题：需要具备强 Hook 和可搜索性，适合作为 YouTube 视频标题，包含用户可能搜索的关键词。" +
  " - 正文（body）：可以理解为视频简介/置顶评论，先用一两句话总结核心看点，再补充关键信息或行动号召，鼓励观众 Like & Subscribe。" +
  "防幻觉与输入质量规则：" +
  " - 请根据用户输入内容本身进行改写，不要凭空捏造不存在的品牌、数据或经历。" +
  " - 如果用户输入的内容过短、为空，或者明显无意义（例如只有少量表情、随机字符、与内容创作无关的噪音信息），不要强行编造完整文案。" +
  " - 在这种情况下，仍然必须保持 JSON 结构不变，但请将各字段内容改写为礼貌、简短的中文提醒，例如提示用户补充创作意图、目标平台、核心卖点等信息。" +
  " - 无论何种情况，都不要输出 JSON 之外的额外文本，也不要假装自己看到了并不存在的详细内容。";

export async function rewriteAction(
  prevState: RewriteState = initialState,
  formData: FormData,
): Promise<RewriteState> {
  const rawInput = formData.get("input")?.toString() ?? "";
  const trimmed = rawInput.trim();

  if (!openai) {
    return {
      results: prevState.results,
      error: "缺少 DEEPSEEK_API_KEY 环境变量，无法调用 DeepSeek 接口。",
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: trimmed,
        },
      ],
    });

    const content =
      completion.choices[0]?.message?.content?.toString().trim() ?? "";

    let parsed = parseJsonFromModel(content);

    if (!parsed) {
      parsed = extractStructuredResultFromText(content);
    }

    if (!parsed) {
      const fallbackResults: RewriteResult[] = [
        {
          style: "xiaohongshu",
          content,
        },
        {
          style: "xiaohongshu_video",
          content,
        },
        {
          style: "weixin",
          content,
        },
        {
          style: "tiktok",
          content,
        },
        {
          style: "douyin",
          content,
        },
        {
          style: "youtube",
          content,
        },
      ];

      return {
        results: fallbackResults,
        error:
          "DeepSeek 返回内容不是有效 JSON，已暂时按同一文案展示在多平台卡片中。",
      };
    }

    const xhsTitle = parsed.xiaohongshu?.title?.toString().trim() ?? "";
    const xhsBody = parsed.xiaohongshu?.body?.toString().trim() ?? "";
    const xhsTags =
      parsed.xiaohongshu?.hashtags
        ?.map((tag) => tag?.toString().trim())
        .filter((tag) => tag && tag.length > 0) ?? [];

    const xhsContentParts: string[] = [];
    if (xhsTitle) {
      xhsContentParts.push(xhsTitle);
    }
    if (xhsBody) {
      xhsContentParts.push(xhsBody);
    }
    if (xhsTags.length > 0) {
      xhsContentParts.push(xhsTags.join(" "));
    }

    const xhsScenes = parsed.xiaohongshu?.video_script?.scenes ?? [];
    let xhsVideoScriptContent = "";

    if (Array.isArray(xhsScenes) && xhsScenes.length > 0) {
      const blocks = xhsScenes
        .map((scene, index) => {
          if (!scene) {
            return "";
          }

          const visual =
            scene.visual && typeof scene.visual === "string"
              ? scene.visual.trim()
              : "";
          const voiceover =
            scene.voiceover && typeof scene.voiceover === "string"
              ? scene.voiceover.trim()
              : "";

          if (!visual && !voiceover) {
            return "";
          }

          const lines: string[] = [];
          lines.push(`镜头 ${index + 1}`);
          if (visual) {
            lines.push(`【视觉画面】${visual}`);
          }
          if (voiceover) {
            lines.push(`【口播文案】${voiceover}`);
          }

          return lines.join("\n");
        })
        .filter((item) => item.length > 0);

      if (blocks.length > 0) {
        xhsVideoScriptContent = ["小红书视频脚本：", ...blocks].join("\n\n");
      }
    }

    const weixinTitle = parsed.weixin?.title?.toString().trim() ?? "";
    const weixinBody = parsed.weixin?.body?.toString().trim() ?? "";
    const weixinContentParts: string[] = [];
    if (weixinTitle) {
      weixinContentParts.push(weixinTitle);
    }
    if (weixinBody) {
      weixinContentParts.push(weixinBody);
    }

    const tiktokTitle = parsed.tiktok?.title?.toString().trim() ?? "";
    const tiktokBody = parsed.tiktok?.body?.toString().trim() ?? "";
    const tiktokContentParts: string[] = [];
    if (tiktokTitle) {
      tiktokContentParts.push(tiktokTitle);
    }
    if (tiktokBody) {
      tiktokContentParts.push(tiktokBody);
    }

    const douyinTitle = parsed.douyin?.title?.toString().trim() ?? "";
    const douyinBody = parsed.douyin?.body?.toString().trim() ?? "";
    const douyinContentParts: string[] = [];
    if (douyinTitle) {
      douyinContentParts.push(douyinTitle);
    }
    if (douyinBody) {
      douyinContentParts.push(douyinBody);
    }

    const douyinScenes = parsed.douyin?.video_script?.scenes ?? [];
    if (Array.isArray(douyinScenes) && douyinScenes.length > 0) {
      const blocks = douyinScenes
        .map((scene, index) => {
          if (!scene) {
            return "";
          }

          const visual =
            scene.visual && typeof scene.visual === "string"
              ? scene.visual.trim()
              : "";
          const voiceover =
            scene.voiceover && typeof scene.voiceover === "string"
              ? scene.voiceover.trim()
              : "";

          if (!visual && !voiceover) {
            return "";
          }

          const lines: string[] = [];
          lines.push(`镜头 ${index + 1}`);
          if (visual) {
            lines.push(`【画面】${visual}`);
          }
          if (voiceover) {
            lines.push(`【台词】${voiceover}`);
          }

          return lines.join("\n");
        })
        .filter((item) => item.length > 0);

      if (blocks.length > 0) {
        douyinContentParts.push(
          ["抖音视频分镜：", ...blocks].join("\n\n"),
        );
      }
    }

    const youtubeTitle = parsed.youtube?.title?.toString().trim() ?? "";
    const youtubeBody = parsed.youtube?.body?.toString().trim() ?? "";
    const youtubeContentParts: string[] = [];
    if (youtubeTitle) {
      youtubeContentParts.push(youtubeTitle);
    }
    if (youtubeBody) {
      youtubeContentParts.push(youtubeBody);
    }

    const baseResults: RewriteResult[] = [
      {
        style: "xiaohongshu",
        content: xhsContentParts.join("\n\n"),
      },
      {
        style: "weixin",
        content: weixinContentParts.join("\n\n"),
      },
      {
        style: "tiktok",
        content: tiktokContentParts.join("\n\n"),
      },
      {
        style: "douyin",
        content: douyinContentParts.join("\n\n"),
      },
      {
        style: "youtube",
        content: youtubeContentParts.join("\n\n"),
      },
    ];

    if (xhsVideoScriptContent) {
      baseResults.push({
        style: "xiaohongshu_video",
        content: xhsVideoScriptContent,
      });
    }

    const results = baseResults.filter((item) => item.content.length > 0);

    return {
      results,
      error: null,
    };
  } catch (error) {
    console.error(error);

    return {
      results: prevState.results,
      error: "调用 DeepSeek 接口失败，请稍后重试。",
    };
  }
}
