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
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../users/auth.guard';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { GenerateStoryDto } from './dto/generate-story.dto';

@ApiTags('stories')
@ApiBearerAuth()
@Controller('stories')
@UseGuards(JwtAuthGuard)
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @ApiOperation({ summary: '生成睡前故事（流式输出）' })
  @ApiBody({
    description: '故事生成参数',
    required: true,
    type: GenerateStoryDto,
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
            thinking: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
          },
        },
      },
    },
  })
  @Post('generate')
  async generateStory(@Request() req, @Body() generateStoryDto: GenerateStoryDto) {
    const response = await this.storiesService.generateStoryStream(generateStoryDto);
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Error processing stream:', error);
      return response;
    }
  }

  @ApiOperation({ summary: '保存睡前故事' })
  @ApiBody({
    description: '故事信息',
    required: true,
    type: CreateStoryDto,
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
            content: { type: 'string' },
            prompt: { type: 'string' },
            type: { type: 'string' },
            length: { type: 'string' },
            ageGroup: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  })
  @Post()
  async create(@Request() req, @Body() createStoryDto: CreateStoryDto) {
    return await this.storiesService.create(req.user.userId, createStoryDto);
  }

  @ApiOperation({ summary: '获取睡前故事列表' })
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
              content: { type: 'string' },
              prompt: { type: 'string' },
              type: { type: 'string' },
              length: { type: 'string' },
              ageGroup: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @Get()
  async findAll(@Request() req) {
    return await this.storiesService.findAllByUserId(req.user.userId);
  }

  @ApiOperation({ summary: '搜索睡前故事' })
  @ApiQuery({ name: 'keyword', description: '搜索关键词（标题或提示词）', required: true })
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
              content: { type: 'string' },
              prompt: { type: 'string' },
              type: { type: 'string' },
              length: { type: 'string' },
              ageGroup: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @Get('search')
  async search(@Request() req, @Query('keyword') keyword: string) {
    return await this.storiesService.search(req.user.userId, keyword);
  }

  @ApiOperation({ summary: '获取单个睡前故事' })
  @ApiParam({ name: 'id', description: '故事ID' })
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
            content: { type: 'string' },
            prompt: { type: 'string' },
            type: { type: 'string' },
            length: { type: 'string' },
            ageGroup: { type: 'string' },
            thinkingProcess: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: '故事不存在' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.storiesService.findOne(id, req.user.userId);
  }

  @ApiOperation({ summary: '删除睡前故事' })
  @ApiParam({ name: 'id', description: '故事ID' })
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
  @ApiResponse({ status: 404, description: '故事不存在' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.storiesService.remove(id, req.user.userId);
    return { message: '删除成功' };
  }
}
