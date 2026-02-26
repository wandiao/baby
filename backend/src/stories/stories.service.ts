import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Story } from './schemas/story.schema';
import { CreateStoryDto } from './dto/create-story.dto';
import { GenerateStoryDto } from './dto/generate-story.dto';
import { OpenAIService } from '../common/services/openai.service';
import { cleanMarkdownCodeBlock } from '../common/utils/string.util';

export interface StreamChunk {
  type: 'thinking' | 'title' | 'content' | 'done';
  content: string;
}

@Injectable()
export class StoriesService {
  constructor(
    @InjectModel(Story.name) private storyModel: Model<Story>,
    private openAIService: OpenAIService,
  ) {}

  async create(userId: string, createStoryDto: CreateStoryDto): Promise<Story> {
    try {
      const story = await this.storyModel.create({
        ...createStoryDto,
        userId: new Types.ObjectId(userId),
      });
      return story;
    } catch (error) {
      console.error('创建故事失败:', error);
      throw new InternalServerErrorException('创建故事失败');
    }
  }

  async findAllByUserId(userId: string): Promise<Story[]> {
    try {
      return await this.storyModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      console.error('获取故事列表失败:', error);
      throw new InternalServerErrorException('获取故事列表失败');
    }
  }

  async findOne(id: string, userId: string): Promise<Story> {
    try {
      const story = await this.storyModel
        .findOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
        .exec();
      if (!story) {
        throw new NotFoundException('故事不存在');
      }
      return story;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('获取故事失败:', error);
      throw new InternalServerErrorException('获取故事失败');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const story = await this.storyModel
        .findOneAndDelete({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
        .exec();
      if (!story) {
        throw new NotFoundException('故事不存在');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('删除故事失败:', error);
      throw new InternalServerErrorException('删除故事失败');
    }
  }

  async search(userId: string, keyword: string): Promise<Story[]> {
    try {
      return await this.storyModel
        .find({
          userId: new Types.ObjectId(userId),
          $or: [
            { title: { $regex: keyword, $options: 'i' } },
            { prompt: { $regex: keyword, $options: 'i' } },
          ],
        })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      console.error('搜索故事失败:', error);
      throw new InternalServerErrorException('搜索故事失败');
    }
  }

  async generateStoryStream(generateStoryDto: GenerateStoryDto): Promise<string> {
    try {
      const { prompt, type = '童话类', length = '中款', ageGroup = '5-7岁' } = generateStoryDto;

      const lengthMap = {
        短款: '50-100字',
        中款: '100-200字',
        长款: '200-300字',
      };

      const systemPrompt = `你是一位专业的儿童睡前故事创作专家，擅长创作温馨、有趣、富有教育意义的睡前故事。

你的任务是：
1. 根据用户提供的提示词创作一个睡前故事
2. 故事类型：${type}
3. 故事长度：${lengthMap[length]}
4. 适合年龄段：${ageGroup}

创作要求：
- 故事内容温馨、积极、富有想象力
- 语言简单易懂，适合${ageGroup}的儿童
- 故事结构清晰，有开头、发展和结尾
- 传递正能量，培养良好的品格
- 避免恐怖、暴力等不适合儿童的内容

输出格式：
请按照以下JSON格式输出：
{
  "title": "故事标题",
  "content": "故事正文"
}`;

      const userPrompt = `请根据以下提示词创作一个睡前故事：
提示词：${prompt}

请按照JSON格式输出，包含标题和正文。`;

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt },
      ];

      const response = await this.openAIService.chatCompletion(messages);
      const cleanedResponse = cleanMarkdownCodeBlock(response);

      return cleanedResponse;
    } catch (error) {
      console.error('生成故事失败:', error);
      throw new InternalServerErrorException('生成故事失败');
    }
  }
}
