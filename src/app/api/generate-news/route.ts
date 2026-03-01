
import OpenAI from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI client with DeepSeek configuration
const apiKey = process.env.DEEPSEEK_API_KEY;
const openai = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com",
    })
  : null;

export async function POST() {
  try {
    if (!openai) {
      // Mock response if API key is missing
      return NextResponse.json({
        title: "AI Daily Briefing: GPT-5 Rumors & New Vision Models",
        category: "AI Hotspots",
        summary: `### 1. OpenAI GPT-5 Rumors Intensify
Recent reports suggest OpenAI is preparing for a major release mid-year. Insiders claim improved reasoning capabilities and multimodal native support.

### 2. Google DeepMind's New Medical AI
DeepMind published a paper on a new foundation model for medical imaging that outperforms human radiologists in early cancer detection.

### 3. Meta Releases Open Source Coding LLM
Meta has released 'CodeLlama-70B-Instruct', setting new benchmarks for open-source code generation models and challenging proprietary alternatives.`
      });
    }

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat", // Using deepseek-chat (V3) which is stable and fast. R1 (reasoner) is also an option but V3 is sufficient for summarization.
      messages: [
        {
          role: "system",
          content: `You are an expert AI News Editor. 
Your task is to search for or summarize the top 3 global AI news stories from the last 24 hours.
Output ONLY a valid JSON object with the following fields:
- "title": A catchy headline for a daily AI news briefing (e.g., "AI Daily: [Key Topic] & More").
- "category": Choose one: "Industry News", "Tech Breakthrough", or "Daily Briefing".
- "summary": A Markdown-formatted string containing 3 distinct news items. Each item should have a bold title and a short description. Use '###' for item titles.
Do not include any markdown formatting (like \`\`\`json) around the output, just the raw JSON string.`
        },
        {
          role: "user",
          content: "Generate today's AI news briefing."
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content received from AI");
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON:", content);
      // Fallback if JSON parsing fails
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedContent);

  } catch (error) {
    console.error("Error generating news:", error);
    return NextResponse.json(
      { error: "Failed to generate news" },
      { status: 500 }
    );
  }
}
