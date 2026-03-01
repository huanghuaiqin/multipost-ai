import { NextResponse } from 'next/server';
import { ZhipuAI } from 'zhipuai';

const apiKey = process.env.ZHIPU_AI_API_KEY;
const client = apiKey ? new ZhipuAI({ apiKey }) : null;

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Fetch HTML content
    let htmlContent = '';
    let pageTitle = '';
    let pageDescription = '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        htmlContent = await response.text();
        
        // Simple regex extraction (lightweight compared to cheerio)
        const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
        pageTitle = titleMatch ? titleMatch[1].trim() : '';

        const metaDescMatch = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                              htmlContent.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
        pageDescription = metaDescMatch ? metaDescMatch[1].trim() : '';
      }
    } catch (fetchError) {
      console.error('Failed to fetch URL:', fetchError);
      // Continue even if fetch fails, AI might guess from URL string alone
    }

    if (!client) {
      return NextResponse.json({ error: 'Zhipu AI API Key missing' }, { status: 500 });
    }

    // 2. Analyze with Zhipu AI
    const systemPrompt = `
      你是一个专业的 AI 工具分析助手。
      请根据提供的 URL 和网页元数据（标题、描述），智能分析并提取该 AI 工具的信息。
      
      输入信息：
      URL: ${url}
      网页标题: ${pageTitle}
      网页描述: ${pageDescription}
      
      请返回以下 JSON 格式（不要包含 markdown）：
      {
        "name": "工具名称（简短，如 ChatGPT）",
        "category": "工具分类（如 Chat, Image, Video, Writing, Audio, Coding, Other）",
        "description": "一句话功能描述（30字以内，中文）",
        "icon": "根据工具类型推荐一个最合适的 Emoji 图标"
      }
    `;

    const aiResponse = await client.chat.completions.create({
      model: 'glm-4',
      messages: [{ role: 'user', content: systemPrompt }],
      stream: false,
    });

    const content = aiResponse.choices[0]?.message?.content || '{}';
    let result = {};
    
    try {
      const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      // Fallback regex
      const match = content.match(/\{.*\}/s);
      if (match) {
        try { result = JSON.parse(match[0]); } catch (e2) {}
      }
    }

    return NextResponse.json({
      ...result,
      url // Echo back the URL
    });

  } catch (error: any) {
    console.error('Analysis Error:', error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
