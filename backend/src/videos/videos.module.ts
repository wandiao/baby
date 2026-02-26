import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { Video, VideoSchema } from './schemas/video.schema';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { VideoTaskService } from '../common/services/video-task.service';
import { CommonModule } from '../common/common.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    CommonModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [VideosController],
  providers: [VideosService, VideoTaskService, JwtService],
})
export class VideosModule {}
