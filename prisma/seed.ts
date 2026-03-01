import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const aiTools = [
  // Chat / LLM
  {
    name: 'ChatGPT',
    description: 'OpenAI 开发的通用 AI 助手，强大的对话和写作能力',
    url: 'https://chat.openai.com',
    category: 'Chat',
    icon: '🤖',
    isHot: true
  },
  {
    name: 'Claude',
    description: 'Anthropic 开发的 AI 助手，擅长长文本分析和编程',
    url: 'https://claude.ai',
    category: 'Chat',
    icon: '🧠',
    isHot: true
  },
  {
    name: 'DeepSeek',
    description: '深度求索开发的国产开源模型，中文理解能力出色',
    url: 'https://chat.deepseek.com',
    category: 'Chat',
    icon: '🐳',
    isHot: true
  },
  {
    name: '智谱清言',
    description: '智谱 AI 推出的生成式 AI 助手，基于 GLM-4 模型',
    url: 'https://chatglm.cn',
    category: 'Chat',
    icon: '🎓',
    isHot: true
  },
  {
    name: 'Kimi 智能助手',
    description: '月之暗面科技推出的 AI 助手，支持超长文本输入',
    url: 'https://kimi.moonshot.cn',
    category: 'Chat',
    icon: '🌙',
    isHot: true
  },
  {
    name: '文心一言',
    description: '百度推出的知识增强大语言模型',
    url: 'https://yiyan.baidu.com',
    category: 'Chat',
    icon: '🇨🇳',
    isHot: false
  },
  {
    name: '通义千问',
    description: '阿里云推出的超大规模语言模型',
    url: 'https://tongyi.aliyun.com',
    category: 'Chat',
    icon: '☁️',
    isHot: false
  },
  {
    name: '豆包',
    description: '字节跳动推出的 AI 对话助手',
    url: 'https://www.doubao.com',
    category: 'Chat',
    icon: '🍡',
    isHot: false
  },

  // Image Generation
  {
    name: 'Midjourney',
    description: '目前效果最强的 AI 绘画工具，需在 Discord 使用',
    url: 'https://www.midjourney.com',
    category: 'Image',
    icon: '🎨',
    isHot: true
  },
  {
    name: 'Stable Diffusion',
    description: '强大的开源 AI 绘画模型，可本地部署',
    url: 'https://stability.ai',
    category: 'Image',
    icon: '🖼️',
    isHot: true
  },
  {
    name: 'DALL·E 3',
    description: 'OpenAI 的绘画模型，集成在 ChatGPT 中',
    url: 'https://openai.com/dall-e-3',
    category: 'Image',
    icon: '🎭',
    isHot: false
  },
  {
    name: 'Leonardo.ai',
    description: '生成高质量游戏资产和艺术作品的 AI 平台',
    url: 'https://leonardo.ai',
    category: 'Image',
    icon: '🦁',
    isHot: false
  },

  // Video Generation
  {
    name: 'Sora',
    description: 'OpenAI 发布的文生视频模型，效果震撼（暂未公测）',
    url: 'https://openai.com/sora',
    category: 'Video',
    icon: '🎥',
    isHot: true
  },
  {
    name: 'Runway',
    description: '专业的 AI 视频编辑和生成工具，支持 Gen-2',
    url: 'https://runwayml.com',
    category: 'Video',
    icon: '🎞️',
    isHot: true
  },
  {
    name: 'Pika',
    description: '简单易用的 AI 视频生成工具，支持动画风格',
    url: 'https://pika.art',
    category: 'Video',
    icon: '🐰',
    isHot: false
  },
  {
    name: '剪映 AI',
    description: '字节跳动推出的视频剪辑工具，内置丰富 AI 功能',
    url: 'https://www.capcut.cn',
    category: 'Video',
    icon: '🎬',
    isHot: true
  },

  // Writing & Efficiency
  {
    name: 'Notion AI',
    description: '集成在 Notion 中的写作助手，笔记增强神器',
    url: 'https://www.notion.so',
    category: 'Writing',
    icon: '📝',
    isHot: true
  },
  {
    name: 'Grammarly',
    description: 'AI 驱动的英语写作助手，自动纠错润色',
    url: 'https://www.grammarly.com',
    category: 'Writing',
    icon: '✍️',
    isHot: false
  },
  {
    name: 'Copy.ai',
    description: '专注于营销文案生成的 AI 工具',
    url: 'https://www.copy.ai',
    category: 'Writing',
    icon: '📢',
    isHot: false
  },

  // Coding
  {
    name: 'GitHub Copilot',
    description: 'GitHub 推出的 AI 编程助手，自动补全代码',
    url: 'https://github.com/features/copilot',
    category: 'Coding',
    icon: '💻',
    isHot: true
  }
];

async function main() {
  console.log('Start seeding AI tools...');

  // Optional: Clear existing tools to avoid duplicates
  // await prisma.aITool.deleteMany({});

  for (const tool of aiTools) {
    const existing = await prisma.aITool.findFirst({
      where: { name: tool.name }
    });

    if (!existing) {
      await prisma.aITool.create({
        data: tool
      });
      console.log(`Created tool: ${tool.name}`);
    } else {
      console.log(`Tool already exists: ${tool.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
