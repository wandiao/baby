import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ unique: true, required: false })
  phone: string;

  @Prop({ required: false })
  password: string;

  @Prop({ required: false })
  nickname: string;

  @Prop({ required: false })
  avatar: string;

  @Prop({ required: false })
  signature: string;

  @Prop({ required: false })
  wechatOpenId: string;

  @Prop({ required: false })
  alipayOpenId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: Date.now })
  lastLoginAt: Date;

  @Prop({ default: 0 })
  loginFailCount: number;

  @Prop({ default: undefined })
  loginLockedUntil?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);