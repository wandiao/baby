import { IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsPhoneNumber('CN', { message: '请输入有效的手机号' })
  @IsNotEmpty({ message: '手机号不能为空' })
  phone: string;

  @ApiProperty({ description: '密码或验证码', example: '123456' })
  @IsNotEmpty({ message: '密码或验证码不能为空' })
  @IsString()
  password: string;

  @ApiProperty({ description: '登录类型', example: 'password', enum: ['password', 'code'] })
  @IsNotEmpty({ message: '登录类型不能为空' })
  @IsString()
  type: 'password' | 'code';
}