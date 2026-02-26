import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Dysmsapi, * as dysmsapi from '@alicloud/dypnsapi20170525';
import * as OpenApi from '@alicloud/openapi-client';
import * as Util from '@alicloud/tea-util';
import Credential from '@alicloud/credentials';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: Dysmsapi;

  constructor(private configService: ConfigService) {
    const config = new OpenApi.Config({
      accessKeyId: this.configService.get('ALI_ACCESS_KEY_ID'),
      accessKeySecret: this.configService.get('ALI_ACCESS_KEY_SECRET'),
    });
    config.endpoint = 'dypnsapi.aliyuncs.com';
    this.client = new Dysmsapi(config);
  }

  async sendSms(phone: string, code: string): Promise<boolean> {
    let sendSmsVerifyCodeRequest = new dysmsapi.SendSmsVerifyCodeRequest({
      signName: '速通互联验证码',
      templateCode: '100001',
      phoneNumber: phone,
      templateParam: '{"code":"##code##","min":"10"}',
    });
    let runtime = new Util.RuntimeOptions({});

    try {
      const response = await this.client.sendSmsVerifyCodeWithOptions(
        sendSmsVerifyCodeRequest,
        runtime,
      );
      this.logger.log(
        `短信发送成功: ${phone}, Code: ${code}, Response: ${JSON.stringify(response.body)}`,
      );
      return response.body?.code === 'OK';
    } catch (error) {
      this.logger.error(`短信发送失败: ${phone}, Error: ${error.message}`);
      return false;
    }
  }

  async validateCode(phone: string, code: string, type?: string): Promise<boolean> {
    let checkSmsVerifyCodeRequest = new dysmsapi.CheckSmsVerifyCodeRequest({
      phoneNumber: phone,
      verifyCode: code,
    });
    let runtime = new Util.RuntimeOptions({});
    try {
      let resp = await this.client.checkSmsVerifyCodeWithOptions(
        checkSmsVerifyCodeRequest,
        runtime,
      );
      console.log(JSON.stringify(resp, null, 2));
      return resp.body?.code === 'OK';
    } catch (error) {
      // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
      // 错误 message
      console.log(error.message);
      // 诊断地址
      console.log(error.data['Recommend']);
      return false;
    }
  }

  async querySendDetails(
    phone: string,
    date: string,
    currentPage: number = 1,
    pageSize: number = 10,
  ): Promise<any> {
    const querySendDetailsRequest = new dysmsapi.QuerySendDetailsRequest({
      phoneNumber: phone,
      sendDate: date,
      currentPage: currentPage.toString(),
      pageSize: pageSize.toString(),
    });

    try {
      const response = await this.client.querySendDetails(querySendDetailsRequest);
      return response.body;
    } catch (error) {
      this.logger.error(`查询短信发送记录失败: ${phone}, Error: ${error.message}`);
      throw error;
    }
  }
}
