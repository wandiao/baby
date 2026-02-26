import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      // 使用类型断言解决delete操作符的问题
      const obj = ret as any;
      delete obj._id;
      delete obj.__v;
      return obj;
    },
  },
})
export class Post extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: [String],
    required: true,
  })
  images: string[];

  @Prop({
    type: String,
    required: true,
  })
  caption: string;

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

export const PostSchema = SchemaFactory.createForClass(Post);