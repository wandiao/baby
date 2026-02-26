import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../users/auth.guard';
import { ComicsService } from './comics.service';
import { CreateComicDto } from './dto/create-comic.dto';
import { GenerateComicDto } from './dto/generate-comic.dto';

@ApiTags('comics')
@ApiBearerAuth()
@Controller('comics')
@UseGuards(JwtAuthGuard)
export class ComicsController {
  constructor(private comicsService: ComicsService) {}

  @ApiOperation({ summary: '生成四格漫画' })
  @ApiBody({
    description: '漫画生成参数',
    required: true,
    type: GenerateComicDto,
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
            images: {
              type: 'array',
              items: { type: 'string' },
            },
            sceneDescriptions: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @Post('generate')
  async generateComic(@Request() req, @Body() generateComicDto: GenerateComicDto) {
    const result = await this.comicsService.generateComic(generateComicDto);
    return result;
  }

  @ApiOperation({ summary: '保存四格漫画' })
  @ApiBody({
    description: '漫画信息',
    required: true,
    type: CreateComicDto,
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
            storyContent: { type: 'string' },
            images: {
              type: 'array',
              items: { type: 'string' },
            },
            sceneDescriptions: {
              type: 'array',
              items: { type: 'string' },
            },
            storyId: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  })
  @Post()
  async create(@Request() req, @Body() createComicDto: CreateComicDto) {
    return await this.comicsService.create(req.user.userId, createComicDto);
  }

  @ApiOperation({ summary: '获取四格漫画列表' })
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
              storyContent: { type: 'string' },
              images: {
                type: 'array',
                items: { type: 'string' },
              },
              sceneDescriptions: {
                type: 'array',
                items: { type: 'string' },
              },
              storyId: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @Get()
  async findAll(@Request() req) {
    return await this.comicsService.findAllByUserId(req.user.userId);
  }

  @ApiOperation({ summary: '获取单个四格漫画' })
  @ApiParam({ name: 'id', description: '漫画ID' })
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
            storyContent: { type: 'string' },
            images: {
              type: 'array',
              items: { type: 'string' },
            },
            sceneDescriptions: {
              type: 'array',
              items: { type: 'string' },
            },
            storyId: { type: 'string' },
            createdAt: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: '漫画不存在' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.comicsService.findOne(id, req.user.userId);
  }

  @ApiOperation({ summary: '删除四格漫画' })
  @ApiParam({ name: 'id', description: '漫画ID' })
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
  @ApiResponse({ status: 404, description: '漫画不存在' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.comicsService.remove(id, req.user.userId);
    return { message: '删除成功' };
  }
}
