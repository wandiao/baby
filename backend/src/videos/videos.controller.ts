import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../users/auth.guard';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { GenerateVideoDto } from './dto/generate-video.dto';

@ApiTags('videos')
@ApiBearerAuth()
@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideosController {
  constructor(private videosService: VideosService) {}

  @ApiOperation({ summary: '生成视频' })
  @ApiBody({
    description: '视频生成参数',
    required: true,
    type: GenerateVideoDto,
  })
  @ApiResponse({
    status: 200,
    description: '生成成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            taskId: { type: 'string' },
            videoId: { type: 'string' },
          },
        },
      },
    },
  })
  @Post('generate')
  async generateVideo(@Request() req, @Body() generateVideoDto: GenerateVideoDto) {
    const result = await this.videosService.generateVideo(generateVideoDto, req.user.userId);
    return result;
  }

  @ApiOperation({ summary: '检查并更新处理中的视频' })
  @ApiResponse({
    status: 200,
    description: '检查成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number' },
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
  })
  @Post('check-processing')
  async checkProcessingVideos() {
    await this.videosService.checkAndUpdateProcessingVideos();
    return { message: '检查完成' };
  }

  @ApiOperation({ summary: '查询视频生成状态' })
  @ApiParam({ name: 'taskId', description: '任务ID' })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            taskId: { type: 'string' },
            status: { type: 'string' },
            videoUrl: { type: 'string' },
          },
        },
      },
    },
  })
  @Get('status/:taskId')
  async getVideoStatus(@Param('taskId') taskId: string) {
    const result = await this.videosService.getVideoGenerationStatus(taskId);
    return result;
  }

  @ApiOperation({ summary: '轮询视频生成状态' })
  @ApiParam({ name: 'taskId', description: '任务ID' })
  @ApiQuery({ name: 'maxAttempts', description: '最大尝试次数', required: false, type: Number })
  @ApiQuery({ name: 'intervalMs', description: '轮询间隔(毫秒)', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            taskId: { type: 'string' },
            status: { type: 'string' },
            videoUrl: { type: 'string' },
          },
        },
      },
    },
  })
  @Get('poll/:taskId')
  async pollVideoStatus(
    @Param('taskId') taskId: string,
    @Query('maxAttempts') maxAttempts?: number,
    @Query('intervalMs') intervalMs?: number,
  ) {
    const result = await this.videosService.pollVideoGenerationStatus(
      taskId,
      maxAttempts,
      intervalMs,
    );
    return result;
  }

  @ApiOperation({ summary: '保存视频' })
  @ApiBody({
    description: '视频信息',
    required: true,
    type: CreateVideoDto,
  })
  @ApiResponse({
    status: 201,
    description: '保存成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            prompt: { type: 'string' },
            referenceUrls: {
              type: 'array',
              items: { type: 'string' },
            },
            videoUrl: { type: 'string' },
            size: { type: 'string' },
            duration: { type: 'number' },
            audio: { type: 'boolean' },
            shotType: { type: 'string' },
            watermark: { type: 'boolean' },
            status: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  })
  @Post()
  async create(@Request() req, @Body() createVideoDto: CreateVideoDto) {
    return await this.videosService.create(req.user.userId, createVideoDto);
  }

  @ApiOperation({ summary: '获取视频列表' })
  @ApiResponse({
    status: 200,
    description: '成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              prompt: { type: 'string' },
              referenceUrls: {
                type: 'array',
                items: { type: 'string' },
              },
              videoUrl: { type: 'string' },
              size: { type: 'string' },
              duration: { type: 'number' },
              audio: { type: 'boolean' },
              shotType: { type: 'string' },
              watermark: { type: 'boolean' },
              status: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @Get()
  async findAll(@Request() req) {
    return await this.videosService.findAllByUserId(req.user.userId);
  }

  @ApiOperation({ summary: '获取单个视频' })
  @ApiParam({ name: 'id', description: '视频ID' })
  @ApiResponse({
    status: 200,
    description: '成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            prompt: { type: 'string' },
            referenceUrls: {
              type: 'array',
              items: { type: 'string' },
            },
            videoUrl: { type: 'string' },
            size: { type: 'string' },
            duration: { type: 'number' },
            audio: { type: 'boolean' },
            shotType: { type: 'string' },
            watermark: { type: 'boolean' },
            status: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: '视频不存在' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.videosService.findOne(id, req.user.userId);
  }

  @ApiOperation({ summary: '删除视频' })
  @ApiParam({ name: 'id', description: '视频ID' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number' },
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '视频不存在' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.videosService.remove(id, req.user.userId);
    return { message: '删除成功' };
  }
}
