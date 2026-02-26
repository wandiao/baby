import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OSS from 'ali-oss';

export interface PostSignatureData {
  policy: string;
  signature: string;
  OSSAccessKeyId: string;
  host: string;
  dir: string;
}

@Injectable()
export class OssService {
  private client: OSS;

  constructor(private configService: ConfigService) {
    this.client = new OSS({
      region: this.configService.get<string>('OSS_REGION'),
      accessKeyId: this.configService.get<string>('ALI_ACCESS_KEY_ID'),
      accessKeySecret: this.configService.get<string>('ALI_ACCESS_KEY_SECRET'),
      bucket: this.configService.get<string>('OSS_BUCKET'),
      dir: 'static/',
    });
  }

  async getPresignedUrl(fileName: string): Promise<string> {
    try {
      const result = await this.client.signatureUrl(fileName, {
        method: 'PUT',
        expires: 3600,
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException('生成预签名URL失败');
    }
  }

  async getPostSignature(): Promise<PostSignatureData> {
    try {
      const date = new Date();
      date.setSeconds(date.getSeconds() + 3600);
      const policy = {
        expiration: date.toISOString(),
        conditions: [
          ['content-length-range', 0, 1048576000],
          { bucket: this.client.options.bucket },
        ],
      };
      const formData = await this.client.calculatePostSignature(policy);
      const bucketLocation = await this.client.getBucketLocation();
      const host = `http://${this.client.options.bucket}.${bucketLocation.location}.aliyuncs.com`;
      console.log(host);
      return {
        policy: formData.policy,
        signature: formData.Signature,
        OSSAccessKeyId: formData.OSSAccessKeyId,
        host,
        dir: 'static/',
      };
    } catch (error) {
      throw new InternalServerErrorException('生成Post签名失败');
    }
  }

  async getPresignedUrls(fileNames: string[]): Promise<Record<string, string>> {
    const urls: Record<string, string> = {};
    for (const fileName of fileNames) {
      urls[fileName] = await this.getPresignedUrl(fileName);
    }
    return urls;
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const fileName = url.split('/').pop();
      if (fileName) {
        await this.client.delete(fileName);
      }
    } catch (error) {
      throw new InternalServerErrorException('删除文件失败');
    }
  }

  async deleteFiles(urls: string[]): Promise<void> {
    const deletePromises = urls.map((url) => this.deleteFile(url));
    await Promise.all(deletePromises);
  }
}
