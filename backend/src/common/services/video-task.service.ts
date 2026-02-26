import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VideosService } from 'src/videos/videos.service';

@Injectable()
export class VideoTaskService {
  private readonly logger = new Logger(VideoTaskService.name);

  constructor(private videosService: VideosService) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleVideoGenerationCheck() {
    this.logger.log('开始检查视频生成状态...');
    try {
      await this.videosService.checkAndUpdateProcessingVideos();
      this.logger.log('视频生成状态检查完成');
    } catch (error) {
      this.logger.error('检查视频生成状态失败:', error);
    }
  }
}
