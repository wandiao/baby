import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CodeDto } from './dto/code.dto';
import { AuthService } from './auth.service';
import { SmsService } from '../common/services/sms.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private authService: AuthService,
    private smsService: SmsService,
  ) {}

  async sendCode(codeDto: CodeDto): Promise<{ message: string }> {
    const { phone, type } = codeDto;

    const code = this.authService.generateCode();
    this.logger.log(`发送验证码 ${code} 到 ${phone}`);
    // 如果不需要发送短信，注释掉这行
    const success = await this.smsService.sendSms(phone, code);
    if (!success) {
      throw new BadRequestException('验证码发送失败，请稍后重试');
    }

    if (!global['smsCodes']) {
      global['smsCodes'] = {};
    }
    global['smsCodes'][`${phone}_${type}`] = {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    return { message: '验证码发送成功' };
  }

  async validateCode(phone: string, code: string, type: string): Promise<boolean> {
    if (!global['smsCodes']) {
      return false;
    }

    const storedCode = global['smsCodes'][`${phone}_${type}`];
    if (!storedCode) {
      return false;
    }

    if (Date.now() > storedCode.expiresAt) {
      return false;
    }

    return storedCode.code === code;
  }

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { phone, code, password, agree } = registerDto;

    const isValid = await this.smsService.validateCode(phone, code, 'register');
    // 如果没有使用短信验证，可切换为使用缓存验证
    // const isValid = await this.validateCode(phone, code, 'register');
    if (!isValid) {
      throw new BadRequestException('验证码错误或已过期');
    }

    const existingUser = await this.userModel.findOne({ phone });
    if (existingUser) {
      throw new BadRequestException('手机号已注册');
    }

    const hashedPassword = await this.authService.hashPassword(password);

    await this.userModel.create({
      phone,
      password: hashedPassword,
      nickname: `用户${phone.slice(-4)}`,
    });

    delete global['smsCodes'][`${phone}_register`];

    return { message: '注册成功' };
  }

  async login(loginDto: LoginDto): Promise<{ token: string; user: any }> {
    const { phone, password, type } = loginDto;

    const user = await this.userModel.findOne({ phone });
    if (!user) {
      throw new UnauthorizedException('手机号未注册');
    }

    if (user.loginLockedUntil && new Date() < user.loginLockedUntil) {
      throw new ForbiddenException('账号已被锁定，请1小时后再试');
    }

    let isValid = false;
    if (type === 'password') {
      isValid = await this.authService.comparePassword(password, user.password);
    } else if (type === 'code') {
      isValid = await this.validateCode(phone, password, 'login');
      if (isValid) {
        delete global['smsCodes'][`${phone}_login`];
      }
    }

    if (!isValid) {
      user.loginFailCount += 1;

      if (user.loginFailCount >= 5) {
        user.loginLockedUntil = new Date(Date.now() + 60 * 60 * 1000);
      }

      await user.save();

      const remainingAttempts = 5 - user.loginFailCount;
      if (remainingAttempts > 0) {
        throw new UnauthorizedException(`密码错误，剩余${remainingAttempts}次机会`);
      } else {
        throw new ForbiddenException('账号已被锁定，请1小时后再试');
      }
    }

    user.loginFailCount = 0;
    user.loginLockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    const token = this.authService.generateToken({ userId: user._id, phone: user.phone });

    return {
      token,
      user: {
        id: user._id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        signature: user.signature,
      },
    };
  }

  // 根据ID查找用户
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  // 根据手机号查找用户
  async findByPhone(phone: string): Promise<User | null> {
    return this.userModel.findOne({ phone }).exec();
  }
}
