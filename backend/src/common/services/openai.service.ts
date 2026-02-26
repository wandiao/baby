import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionContentPart, ChatCompletionMessageParam } from 'openai/resources';
import { cleanMarkdownCodeBlock } from '../utils/string.util';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

export interface ComicImageResult {
  imageUrl: string;
  sceneDescription: string;
}

export interface VideoGenerationResult {
  taskId: string;
  status: string;
  videoUrl?: string;
}

@Injectable()
export class OpenAIService {
  private client: OpenAI;
  private readonly logger = new Logger(OpenAIService.name);

  constructor(private configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: this.configService.get<string>(
        'OPENAI_BASE_URL',
        'https://dashscope.aliyuncs.com/compatible-mode/v1',
      ),
    });
  }

  async chatCompletion(messages: ChatCompletionMessageParam[]): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'qwen3.5-flash',
        messages,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new InternalServerErrorException('未获取到响应内容');
      }

      return content;
    } catch (error) {
      this.logger.error('OpenAI API调用失败', error);
      throw new InternalServerErrorException('生成配文失败');
    }
  }

  async chatCompletionStream(messages: ChatCompletionMessageParam[]): Promise<string> {
    return await this.chatCompletion(messages);
  }

  async generateCaption(currentImage: string, previousImage?: string): Promise<string> {
    let systemPrompt =
      '你是一位充满爱心和温暖的配文创作专家，专门为宝妈群体和爱宠人士创作温馨美好的配文。你的任务是根据提供的图片，先仔细观察并描述照片中的内容，然后基于描述创作一段富有情感、充满纪念意义的配文。';

    let userPrompt = '';

    if (previousImage) {
      systemPrompt +=
        '\n\n特别说明：用户上传了两张照片，这是他们记录成长或陪伴的珍贵时刻。请先分别描述两张照片的内容，然后重点描述第二张照片，同时巧妙地对比两张照片的变化，突出成长的喜悦或陪伴的温馨。';
      userPrompt = `请为这两张照片创作配文：\n\n第一张照片（最新上传），第二张照片（之前的记录），请按以下步骤完成：\n\n第一步：照片内容描述\n- 仔细观察第一张照片，描述其中的内容（孩子的表情、动作、穿着、环境，或宠物的特征、动作等）\n- 仔细观察第二张照片，详细描述其中的内容（孩子的表情、动作、穿着、环境，或宠物的特征、动作等）\n- 对比两张照片，描述其中的变化和差异\n\n第二步：配文创作\n基于上述描述，创作一段温馨的配文：\n1. 重点描述第二张照片中的美好瞬间\n2. 巧妙对比两张照片，强调成长的变化或陪伴的温馨\n3. 使用充满爱意和纪念意义的词汇\n4. 突出孩子或宠物的可爱特征和成长变化\n5. 语言温馨感人，适合宝妈或爱宠人士分享\n6. 适当使用emoji增加温馨感\n7. 配文长度在100-200字之间\n\n最终只返回配文内容，不要包含照片描述或其他说明。`;
    } else {
      userPrompt = `请为这张照片创作配文，请按以下步骤完成：\n\n第一步：照片内容描述\n- 仔细观察照片，详细描述其中的内容\n- 如果是孩子：描述表情、动作、穿着、年龄特征、环境等\n- 如果是宠物：描述品种、特征、动作、表情、环境等\n- 捕捉照片中的温馨瞬间和细节\n\n第二步：配文创作\n基于上述描述，创作一段温馨的配文：\n1. 结合照片内容，突出孩子或宠物的可爱特征\n2. 使用充满爱意和纪念意义的词汇\n3. 语言温馨感人，适合宝妈或爱宠人士分享\n4. 适当使用emoji增加温馨感\n5. 配文长度在100-200字之间\n\n最终只返回配文内容，不要包含照片描述或其他说明。`;
    }

    const userContent: ChatCompletionContentPart[] = [
      { type: 'text', text: userPrompt },
      { type: 'image_url', image_url: { url: currentImage } },
    ];
    if (previousImage) {
      userContent.push({ type: 'image_url', image_url: { url: previousImage } });
    }

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: userContent,
      },
    ];

    return await this.chatCompletion(messages);
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      const url =
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-image-2.0-pro',
          input: {
            messages: [
              {
                role: 'user',
                content: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          },
          parameters: {
            negative_prompt:
              '低分辨率，低画质，肢体畸形，手指畸形，画面过饱和，蜡像感，人脸无细节，过度光滑，画面具有AI感。构图混乱。文字模糊，扭曲。',
            prompt_extend: true,
            watermark: false,
            size: '1024*1024',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`图片生成API调用失败: ${response.status} - ${errorText}`);
        throw new InternalServerErrorException('图片生成失败');
      }

      const data = await response.json();
      console.log(data);
      const imageUrl = data.output?.choices?.[0]?.message?.content?.[0]?.image;
      console.log(imageUrl);

      if (!imageUrl) {
        this.logger.error('未获取到图片URL', data);
        throw new InternalServerErrorException('未获取到生成的图片');
      }

      return imageUrl;
    } catch (error) {
      this.logger.error('图片生成失败', error);
      throw new InternalServerErrorException('图片生成失败');
    }
  }

  async generateFourPanelComic(storyContent: string): Promise<ComicImageResult[]> {
    try {
      const scenePrompts = await this.generateScenePrompts(storyContent);

      const combinedPrompt = this.buildCombinedPrompt(scenePrompts);
      const imageUrl = await this.generateImage(combinedPrompt);

      const results: ComicImageResult[] = scenePrompts.map((scene) => ({
        imageUrl,
        sceneDescription: scene.description,
      }));

      return results;
    } catch (error) {
      this.logger.error('四格漫画生成失败', error);
      throw new InternalServerErrorException('四格漫画生成失败');
    }
  }

  private buildCombinedPrompt(scenes: Array<{ prompt: string; description: string }>): string {
    const sceneDescriptions = scenes
      .map((scene, index) => `场景${index + 1}：${scene.description}`)
      .join('\n');

    return `请创作一幅四格漫画，画面分为四个格子，从左到右、从上到下依次展示以下四个连续场景：

${sceneDescriptions}

绘画要求：
- 采用四格漫画的布局，画面分为四个等大的格子
- 每个格子展示一个场景，场景之间要有连贯性
- 风格要温馨、可爱、色彩鲜艳，适合儿童阅读
- 采用儿童绘本插画风格
- 人物形象要可爱生动
- 背景要简洁明亮`;
  }

  private async generateScenePrompts(
    storyContent: string,
  ): Promise<Array<{ prompt: string; description: string }>> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content:
            '你是一位专业的儿童绘本插画师，擅长将故事内容转化为生动的四格漫画场景。请根据提供的故事内容，将其分解为4个连续的场景，每个场景都要有明确的画面描述和绘画提示。',
        },
        {
          role: 'user',
          content: `请将以下故事内容分解为4个连续的四格漫画场景，每个场景包含：
1. 场景描述：用简洁的语言描述这个场景的画面内容
2. 绘画提示：用于生成图片的详细提示词，包括人物、动作、环境、色彩、风格等

故事内容：${storyContent}

请以JSON格式返回，格式如下：
{
  "scenes": [
    {
      "description": "场景描述",
      "prompt": "绘画提示词"
    }
  ]
}

要求：
- 场景要连贯，符合故事情节发展
- 绘画提示要详细，适合生成儿童绘本风格的图片
- 风格要温馨、可爱、色彩鲜艳
- 适合儿童阅读`,
        },
      ];

      const response = await this.chatCompletion(messages);
      const cleanedResponse = cleanMarkdownCodeBlock(response);
      const parsed = JSON.parse(cleanedResponse);

      if (!parsed.scenes || !Array.isArray(parsed.scenes) || parsed.scenes.length !== 4) {
        throw new InternalServerErrorException('场景生成失败');
      }

      return parsed.scenes;
    } catch (error) {
      this.logger.error('场景提示生成失败', error);
      throw new InternalServerErrorException('场景提示生成失败');
    }
  }

  async generateVideo(
    prompt: string,
    referenceUrls: string[],
    options?: {
      size?: string;
      duration?: number;
      audio?: boolean;
      shotType?: string;
      watermark?: boolean;
    },
  ): Promise<VideoGenerationResult> {
    try {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      const url =
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-DashScope-Async': 'enable',
        },
        body: JSON.stringify({
          model: 'wan2.6-r2v',
          input: {
            prompt,
            reference_urls: referenceUrls,
          },
          parameters: {
            size: options?.size || '1280*720',
            duration: options?.duration || 2,
            audio: options?.audio !== undefined ? options.audio : true,
            shot_type: options?.shotType || 'multi',
            watermark: options?.watermark !== undefined ? options.watermark : true,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`视频生成API调用失败: ${response.status} - ${errorText}`);
        throw new InternalServerErrorException('视频生成失败');
      }

      const data = await response.json();
      this.logger.log('视频生成任务已提交', data);

      const taskId = data.output?.task_id;
      if (!taskId) {
        this.logger.error('未获取到任务ID', data);
        throw new InternalServerErrorException('未获取到任务ID');
      }

      return {
        taskId,
        status: 'pending',
      };
    } catch (error) {
      this.logger.error('视频生成失败', error);
      throw new InternalServerErrorException('视频生成失败');
    }
  }

  async getVideoGenerationStatus(taskId: string): Promise<VideoGenerationResult> {
    try {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      const url = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`查询视频生成状态失败: ${response.status} - ${errorText}`);
        throw new InternalServerErrorException('查询视频生成状态失败');
      }

      const data = await response.json();
      this.logger.log('视频生成状态查询结果', data);

      const taskStatus = data.output?.task_status;
      const videoUrl = data.output?.video_url;

      if (!taskStatus) {
        this.logger.error('未获取到任务状态', data);
        throw new InternalServerErrorException('未获取到任务状态');
      }

      const result: VideoGenerationResult = {
        taskId,
        status: taskStatus,
      };

      if (videoUrl) {
        result.videoUrl = videoUrl;
      }

      return result;
    } catch (error) {
      this.logger.error('查询视频生成状态失败', error);
      throw new InternalServerErrorException('查询视频生成状态失败');
    }
  }

  async pollVideoGenerationStatus(
    taskId: string,
    maxAttempts: number = 30,
    intervalMs: number = 5000,
  ): Promise<VideoGenerationResult> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const result = await this.getVideoGenerationStatus(taskId);

      if (result.status === 'SUCCEEDED' && result.videoUrl) {
        this.logger.log('视频生成成功', result);
        return result;
      }

      if (result.status === 'FAILED' || result.status === 'CANCELED') {
        this.logger.error('视频生成失败或被取消', result);
        throw new InternalServerErrorException('视频生成失败');
      }

      if (result.status === 'PENDING' || result.status === 'RUNNING') {
        attempts++;
        this.logger.log(`视频生成中... (${attempts}/${maxAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      } else {
        this.logger.error('未知的任务状态', result);
        throw new InternalServerErrorException('未知的任务状态');
      }
    }

    this.logger.error('视频生成超时');
    throw new InternalServerErrorException('视频生成超时');
  }
}
