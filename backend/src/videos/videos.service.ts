import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Video } from './schemas/video.schema';
import { CreateVideoDto } from './dto/create-video.dto';
import { GenerateVideoDto } from './dto/generate-video.dto';
import { OpenAIService, VideoGenerationResult } from '../common/services/openai.service';
import { OssService } from '../common/services/oss.service';

@Injectable()
export class VideosService {
  constructor(
    @InjectModel(Video.name) private videoModel: Model<Video>,
    private openAIService: OpenAIService,
    private ossService: OssService,
  ) {}

  async create(userId: string, createVideoDto: CreateVideoDto): Promise<Video> {
    try {
      const video = await this.videoModel.create({
        ...createVideoDto,
        userId: new Types.ObjectId(userId),
        status: 'completed',
      });
      return video;
    } catch (error) {
      console.error('创建视频失败:', error);
      throw new InternalServerErrorException('创建视频失败');
    }
  }

  async findAllByUserId(userId: string): Promise<Video[]> {
    try {
      return await this.videoModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      console.error('获取视频列表失败:', error);
      throw new InternalServerErrorException('获取视频列表失败');
    }
  }

  async findOne(id: string, userId: string): Promise<Video> {
    try {
      const video = await this.videoModel
        .findOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
        .exec();
      if (!video) {
        throw new NotFoundException('视频不存在');
      }
      return video;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('获取视频失败:', error);
      throw new InternalServerErrorException('获取视频失败');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const video = await this.videoModel
        .findOneAndDelete({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
        .exec();
      if (!video) {
        throw new NotFoundException('视频不存在');
      }

      await this.ossService.deleteFiles([video.videoUrl]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('删除视频失败:', error);
      throw new InternalServerErrorException('删除视频失败');
    }
  }

  async generateVideo(
    generateVideoDto: GenerateVideoDto,
    userId: string,
  ): Promise<{ taskId: string; videoId: string }> {
    try {
      const {
        prompt,
        referenceUrls,
        size = '1280*720',
        duration = 5,
        audio = true,
        shotType = 'multi',
        watermark = true,
        title = '视频创作',
      } = generateVideoDto;

      const result = await this.openAIService.generateVideo(prompt, referenceUrls, {
        size,
        duration,
        audio,
        shotType,
        watermark,
      });

      const video = await this.videoModel.create({
        userId: new Types.ObjectId(userId),
        title,
        prompt,
        referenceUrls,
        taskId: result.taskId,
        size,
        duration,
        audio,
        shotType,
        watermark,
        status: 'processing',
        videoUrl: '',
      });

      return {
        taskId: result.taskId,
        videoId: video._id.toString(),
      };
    } catch (error) {
      console.error('生成视频失败:', error);
      throw new InternalServerErrorException('生成视频失败');
    }
  }

  async updateVideoStatus(
    videoId: string,
    userId: string,
    updates: {
      videoUrl?: string;
      status?: string;
      errorMessage?: string;
    },
  ): Promise<Video> {
    try {
      const video = await this.videoModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(videoId), userId: new Types.ObjectId(userId) },
          updates,
          { new: true },
        )
        .exec();

      if (!video) {
        throw new NotFoundException('视频不存在');
      }

      return video;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('更新视频状态失败:', error);
      throw new InternalServerErrorException('更新视频状态失败');
    }
  }

  async checkAndUpdateProcessingVideos(): Promise<void> {
    try {
      const processingVideos = await this.videoModel.find({ status: 'processing' }).exec();

      for (const video of processingVideos) {
        try {
          const result = await this.openAIService.getVideoGenerationStatus(video.taskId);

          if (result.status === 'SUCCEEDED' && result.videoUrl) {
            await this.videoModel.updateOne(
              { _id: video._id },
              {
                videoUrl: result.videoUrl,
                status: 'completed',
              },
            );
            console.log(`视频 ${video._id} 生成成功`);
          } else if (result.status === 'FAILED' || result.status === 'CANCELED') {
            await this.videoModel.updateOne(
              { _id: video._id },
              {
                status: 'failed',
                errorMessage: '视频生成失败',
              },
            );
            console.log(`视频 ${video._id} 生成失败`);
          }
        } catch (error) {
          console.error(`检查视频 ${video._id} 状态失败:`, error);
        }
      }
    } catch (error) {
      console.error('检查处理中视频失败:', error);
    }
  }

  async getVideoGenerationStatus(taskId: string): Promise<VideoGenerationResult> {
    try {
      return await this.openAIService.getVideoGenerationStatus(taskId);
    } catch (error) {
      console.error('查询视频生成状态失败:', error);
      throw new InternalServerErrorException('查询视频生成状态失败');
    }
  }

  async pollVideoGenerationStatus(
    taskId: string,
    maxAttempts: number = 30,
    intervalMs: number = 5000,
  ): Promise<VideoGenerationResult> {
    try {
      return await this.openAIService.pollVideoGenerationStatus(taskId, maxAttempts, intervalMs);
    } catch (error) {
      console.error('轮询视频生成状态失败:', error);
      throw new InternalServerErrorException('轮询视频生成状态失败');
    }
  }
}
