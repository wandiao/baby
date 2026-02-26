import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../users/auth.guard';
import { OssService, PostSignatureData } from '../services/oss.service';

@ApiTags('oss')
@ApiBearerAuth()
@Controller('oss')
@UseGuards(JwtAuthGuard)
export class OssController {
  constructor(private ossService: OssService) {}

  @ApiOperation({ summary: '获取表单上传签名' })
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
            policy: { type: 'string' },
            signature: { type: 'string' },
            OSSAccessKeyId: { type: 'string' },
            host: { type: 'string' },
            dir: { type: 'string' },
          },
        },
      },
    },
  })
  @Post('presign')
  async getPostSignature(): Promise<PostSignatureData> {
    const signatureData = await this.ossService.getPostSignature();
    return signatureData;
  }
}
