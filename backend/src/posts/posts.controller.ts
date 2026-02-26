import {
  Controller,
  Post,
  Get,
  Put,
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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('posts')
@ApiBearerAuth()
@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private postsService: PostsService) {}

  @ApiOperation({ summary: '生成配文' })
  @ApiBody({
    description: '图片URL',
    required: true,
    schema: {
      type: 'object',
      properties: { image: { type: 'string' } },
    },
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
            caption: { type: 'string' },
          },
        },
      },
    },
  })
  @Post('generate-caption')
  async generateCaption(@Request() req, @Body('image') image: string) {
    const caption = await this.postsService.generateCaption(req.user.userId, image);
    return { caption };
  }

  @ApiOperation({ summary: '创建帖子' })
  @ApiBody({ description: '帖子信息', required: true, type: CreatePostDto })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number' },
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
  })
  @Post()
  async create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return await this.postsService.create(req.user.userId, createPostDto);
  }

  @ApiOperation({ summary: '获取帖子列表' })
  @ApiResponse({
    status: 200,
    description: '成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number' },
        message: { type: 'string' },
        data: { type: 'array' },
      },
    },
  })
  @Get()
  async findAll(@Request() req) {
    return await this.postsService.findAllByUserId(req.user.userId);
  }

  @ApiOperation({ summary: '获取单个帖子' })
  @ApiParam({ name: 'id', description: '帖子ID' })
  @ApiResponse({
    status: 200,
    description: '成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number' },
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '帖子不存在' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return await this.postsService.findOne(id, req.user.userId);
  }

  @ApiOperation({ summary: '更新帖子' })
  @ApiParam({ name: 'id', description: '帖子ID' })
  @ApiBody({ description: '更新信息', required: true, type: UpdatePostDto })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number' },
        message: { type: 'string' },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 404, description: '帖子不存在' })
  @Put(':id')
  async update(@Param('id') id: string, @Request() req, @Body() updatePostDto: UpdatePostDto) {
    return await this.postsService.update(id, req.user.userId, updatePostDto);
  }

  @ApiOperation({ summary: '删除帖子' })
  @ApiParam({ name: 'id', description: '帖子ID' })
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
  @ApiResponse({ status: 404, description: '帖子不存在' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    await this.postsService.remove(id, req.user.userId);
    return { message: '删除成功' };
  }
}
