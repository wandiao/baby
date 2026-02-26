import { IsNotEmpty, IsString, IsPhoneNumber, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsPhoneNumber('CN', { message: '请输入有效的手机号' })
  @IsNotEmpty({ message: '手机号不能为空' })
  phone: string;

  @ApiProperty({ description: '验证码', example: '123456' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @IsString()
  code: string;

  @ApiProperty({ description: '密码', example: 'Aa123456' })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  @MaxLength(18, { message: '密码长度不能超过18位' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,18}$/, {
    message: '密码必须包含字母和数字',
  })
  password: string;

  @ApiProperty({ description: '是否同意用户协议和隐私政策', example: true })
  @IsNotEmpty({ message: '请阅读并同意用户协议和隐私政策' })
  agree: boolean;
}