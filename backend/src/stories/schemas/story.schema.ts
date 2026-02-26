import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      const obj = ret as any;
      delete obj._id;
      delete obj.__v;
      return obj;
    },
  },
})
export class Story extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: String,
    required: true,
  })
  prompt: string;

  @Prop({
    type: String,
    enum: ['童话类', '科普类', '安抚类', '动物类', '自定义类'],
    default: '童话类',
  })
  type: string;

  @Prop({
    type: String,
    enum: ['短款', '中款', '长款'],
    default: '中款',
  })
  length: string;

  @Prop({
    type: String,
    enum: ['2-4岁', '5-7岁', '7岁以上'],
    default: '5-7岁',
  })
  ageGroup: string;

  @Prop({
    type: String,
  })
  thinkingProcess: string;

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    type: Date,
    default: Date.now,
  })
  updatedAt: Date;
}

export const StorySchema = SchemaFactory.createForClass(Story);
