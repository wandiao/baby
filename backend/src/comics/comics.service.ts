import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comic } from './schemas/comic.schema';
import { CreateComicDto } from './dto/create-comic.dto';
import { GenerateComicDto } from './dto/generate-comic.dto';
import { OpenAIService, ComicImageResult } from '../common/services/openai.service';
import { OssService } from '../common/services/oss.service';

@Injectable()
export class ComicsService {
  constructor(
    @InjectModel(Comic.name) private comicModel: Model<Comic>,
    private openAIService: OpenAIService,
    private ossService: OssService,
  ) {}

  async create(userId: string, createComicDto: CreateComicDto): Promise<Comic> {
    try {
      const comic = await this.comicModel.create({
        ...createComicDto,
        userId: new Types.ObjectId(userId),
        storyId: createComicDto.storyId ? new Types.ObjectId(createComicDto.storyId) : undefined,
      });
      return comic;
    } catch (error) {
      console.error('创建漫画失败:', error);
      throw new InternalServerErrorException('创建漫画失败');
    }
  }

  async findAllByUserId(userId: string): Promise<Comic[]> {
    try {
      return await this.comicModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      console.error('获取漫画列表失败:', error);
      throw new InternalServerErrorException('获取漫画列表失败');
    }
  }

  async findOne(id: string, userId: string): Promise<Comic> {
    try {
      const comic = await this.comicModel
        .findOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
        .exec();
      if (!comic) {
        throw new NotFoundException('漫画不存在');
      }
      return comic;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('获取漫画失败:', error);
      throw new InternalServerErrorException('获取漫画失败');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const comic = await this.comicModel
        .findOneAndDelete({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
        .exec();
      if (!comic) {
        throw new NotFoundException('漫画不存在');
      }

      await this.ossService.deleteFiles(comic.images);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('删除漫画失败:', error);
      throw new InternalServerErrorException('删除漫画失败');
    }
  }

  async generateComic(generateComicDto: GenerateComicDto): Promise<{
    images: string[];
    sceneDescriptions: string[];
  }> {
    try {
      const { storyContent, title = '四格漫画' } = generateComicDto;

      const comicResults: ComicImageResult[] = await this.openAIService.generateFourPanelComic(storyContent);

      const images = comicResults.map((result) => result.imageUrl);
      const sceneDescriptions = comicResults.map((result) => result.sceneDescription);

      return {
        images,
        sceneDescriptions,
      };
    } catch (error) {
      console.error('生成漫画失败:', error);
      throw new InternalServerErrorException('生成漫画失败');
    }
  }
}
