import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { OssService } from '../common/services/oss.service';
import { OpenAIService } from '../common/services/openai.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private ossService: OssService,
    private openAIService: OpenAIService,
  ) {}

  async create(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    try {
      const post = await this.postModel.create({
        ...createPostDto,
        userId: new Types.ObjectId(userId),
      });
      return post;
    } catch (error) {
      throw new InternalServerErrorException('创建帖子失败');
    }
  }

  async findAllByUserId(userId: string): Promise<Post[]> {
    try {
      return await this.postModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('获取帖子列表失败');
    }
  }

  async findOne(id: string, userId: string): Promise<Post> {
    try {
      const post = await this.postModel
        .findOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
        .exec();
      if (!post) {
        throw new NotFoundException('帖子不存在');
      }
      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('获取帖子失败');
    }
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostDto): Promise<Post> {
    try {
      const post = await this.postModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
          updatePostDto,
          { new: true },
        )
        .exec();
      if (!post) {
        throw new NotFoundException('帖子不存在');
      }
      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('更新帖子失败');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const post = await this.postModel
        .findOneAndDelete({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
        .exec();
      if (!post) {
        throw new NotFoundException('帖子不存在');
      }
      // 删除关联的图片
      await this.ossService.deleteFiles(post.images);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('删除帖子失败');
    }
  }

  async generateCaption(userId: string, currentImage: string): Promise<string> {
    try {
      let previousImage: string | undefined;

      const previousPost = await this.postModel
        .findOne({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .exec();

      if (previousPost && previousPost.images && previousPost.images.length > 0) {
        previousImage = previousPost.images[0];
      }

      return await this.openAIService.generateCaption(currentImage, previousImage);
    } catch (error) {
      console.error('生成配文失败:', error);
      throw new InternalServerErrorException('生成配文失败');
    }
  }
}
