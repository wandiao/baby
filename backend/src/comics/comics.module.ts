import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Comic, ComicSchema } from './schemas/comic.schema';
import { ComicsController } from './comics.controller';
import { ComicsService } from './comics.service';
import { CommonModule } from '../common/common.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comic.name, schema: ComicSchema }]),
    CommonModule,
  ],
  controllers: [ComicsController],
  providers: [ComicsService, JwtService],
})
export class ComicsModule {}
