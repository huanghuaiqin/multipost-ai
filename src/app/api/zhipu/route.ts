import { NextResponse } from 'next/server';
import { ZhipuAI } from 'zhipuai';
import { prisma } from '@/lib/prisma';

// Initialize ZhipuAI client with API key from environment variables
// Note: ZHIPU_AI_API_KEY should be set in .env
const apiKey = process.env.ZHIPU_AI_API_KEY;
console.log('ZHIPU_AI_API_KEY present:', !!apiKey);
console.log('Env keys:', Object.keys(process.env).filter(k => k.includes('ZHIPU')));

// Create the client only if the key exists to avoid initialization errors
const client = apiKey ? new ZhipuAI({ apiKey }) : null;

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Validate API Key
    if (!client) {
      console.error('ZHIPU_AI_API_KEY is missing in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: API Key missing' },
        { status: 500 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { prompt, stream = false, type = 'chat' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing required field: prompt' },
        { status: 400 }
      );
    }

    // 2.5. Special handling for tool recommendation
    if (type === 'recommendation') {
      let tools = [];
      try {
        tools = await prisma.aITool.findMany({
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            url: true,
            icon: true
          }
        });
      } catch (dbError) {
        console.error('Database fetch error in Zhipu API:', dbError);
        // Fallback: If DB fails, we can either return an error or proceed with empty tools (AI will just hallucinate or fail)
        // Let's provide a minimal fallback list to ensure the feature doesn't completely crash
        tools = [
          { id: 'fallback-1', name: 'ChatGPT', description: 'OpenAI 开发的通用 AI 助手', category: 'Chat', url: 'https://chat.openai.com', icon: '🤖' },
          { id: 'fallback-2', name: 'Midjourney', description: '强大的 AI 绘画工具', category: 'Image', url: 'https://www.midjourney.com', icon: '🎨' },
          { id: 'fallback-3', name: 'Notion AI', description: '集成在 Notion 中的写作助手', category: 'Writing', url: 'https://www.notion.so', icon: '📝' }
        ];
      }

      const systemPrompt = `
        你是一个专业的 AI 工具推荐助手。
        请根据用户的需求，从下面的 AI 工具列表中挑选最合适的 3 个工具。
        
        工具列表：
        ${JSON.stringify(tools)}
        
        用户需求：${prompt}
        
        请严格按照以下 JSON 格式返回结果（不要包含任何 markdown 标记或额外的解释）：
        [
          {
            "id": "工具ID",
            "reason": "简短推荐理由（20字以内）"
          }
        ]
      `;

      try {
        const response = await client.chat.completions.create({
          model: 'glm-4',
          messages: [{ role: 'user', content: systemPrompt }],
          stream: false,
        });

        const content = response.choices[0]?.message?.content || '[]';
        let recommendations = [];
        
        // Clean up potential markdown code blocks
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        
        try {
          recommendations = JSON.parse(jsonStr);
        } catch (parseError) {
          console.error('Failed to parse recommendation JSON:', parseError, content);
          // Fallback: try to extract JSON array via regex
          const match = content.match(/\[[\s\S]*\]/);
          if (match) {
            try {
              recommendations = JSON.parse(match[0]);
            } catch (regexError) {
              console.error('Regex fallback failed:', regexError);
            }
          }
        }

        // Merge recommendation reason with tool data
        const results = recommendations.map((rec: any) => {
          const tool = tools.find((t: any) => t.id === rec.id);
          // If tool not found by ID (maybe AI hallucinated ID), try to find by name or just use the AI's data if provided?
          // No, better to return only valid tools.
          return tool ? { ...tool, reason: rec.reason } : null;
        }).filter(Boolean);

        return NextResponse.json({ recommendations: results });

      } catch (apiError: any) {
        console.error('Zhipu AI API Error (Recommendation):', apiError);
        return NextResponse.json(
          { error: apiError.message || 'Failed to generate recommendations' },
          { status: 500 }
        );
      }
    }

    // 2.6. Handle 'generate_description' type (Tool Name -> Description/Category)
    else if (type === 'generate_description') {
      const systemPrompt = `
        你是一个专业的 AI 工具分析师。
        请根据用户提供的 AI 工具名称，生成一段专业的简介（50字以内）并推荐最合适的分类。
        
        工具名称：${prompt}
        
        请返回以下 JSON 格式（不要包含 markdown）：
        {
          "description": "专业的中文简介（50字以内）",
          "category": "推荐分类（从以下选项中选择：Chat, Image, Video, Writing, Audio, Coding, Learning, Other）",
          "icon": "推荐Emoji图标"
        }
      `;

      try {
        const response = await client.chat.completions.create({
          model: 'glm-4',
          messages: [{ role: 'user', content: systemPrompt }],
          stream: false,
        });

        const content = response.choices[0]?.message?.content || '{}';
        let result = {};
        
        // Clean up potential markdown code blocks
        const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim();
        
        try {
          result = JSON.parse(jsonStr);
        } catch (parseError) {
          console.error('Failed to parse generation JSON:', parseError, content);
          // Fallback regex
          const match = content.match(/\{[\s\S]*\}/);
          if (match) {
            try { result = JSON.parse(match[0]); } catch (e2) {}
          }
        }

        return NextResponse.json(result);
      } catch (aiError: any) {
        console.error('Zhipu AI Generation Error:', aiError);
        return NextResponse.json(
          { error: aiError.message || 'AI generation failed' },
          { status: 500 }
        );
      }
    }

    // 3. Call Zhipu AI (GLM-4)
    if (stream) {
      console.log('Starting stream request to Zhipu AI...');
      // Streaming response handling
      const streamResponse = await client.chat.completions.create({
        model: 'glm-4',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      });
      console.log('Stream response received from Zhipu AI');

      // Create a ReadableStream to pipe the Zhipu AI response
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            console.log('Start processing stream chunks...');
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            }
            console.log('Stream processing completed');
            controller.close();
          } catch (err) {
            console.error('Streaming error inside ReadableStream:', err);
            controller.error(err);
          }
        },
      });

      return new NextResponse(readableStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    } else {
      // Standard JSON response
      const response = await client.chat.completions.create({
        model: 'glm-4',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      });

      const content = response.choices[0]?.message?.content || '';
      
      return NextResponse.json({ 
        content,
        raw: response 
      });
    }

  } catch (error: any) {
    console.error('Zhipu AI API Error:', error);
    
    // Provide clear error message
    const errorMessage = error.message || 'Internal Server Error';
    const status = error.status || 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: status }
    );
  }
}
