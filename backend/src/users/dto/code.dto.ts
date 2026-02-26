import { IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CodeDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsPhoneNumber('CN', { message: '请输入有效的手机号' })
  @IsNotEmpty({ message: '手机号不能为空' })
  phone: string;

  @ApiProperty({
    description: '验证码类型',
    example: 'register',
    enum: ['register', 'login', 'reset'],
  })
  @IsNotEmpty({ message: '类型不能为空' })
  @IsString()
  type: 'register' | 'login' | 'reset';
}
