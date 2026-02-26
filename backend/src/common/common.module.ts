import { Module } from '@nestjs/common';
import { OssService } from './services/oss.service';
import { OpenAIService } from './services/openai.service';
import { SmsService } from './services/sms.service';
import { OssController } from './controllers/oss.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [OssController],
  providers: [OssService, OpenAIService, SmsService, JwtService],
  exports: [OssService, OpenAIService, SmsService],
})
export class CommonModule {}
