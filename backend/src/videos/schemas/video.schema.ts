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
export class Video extends Document {
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
  prompt: string;

  @Prop({
    type: [String],
    required: true,
  })
  referenceUrls: string[];

  @Prop({
    type: String,
    required: false,
  })
  videoUrl: string;

  @Prop({
    type: String,
  })
  size: string;

  @Prop({
    type: Number,
  })
  duration: number;

  @Prop({
    type: Boolean,
    default: true,
  })
  audio: boolean;

  @Prop({
    type: String,
  })
  shotType: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  watermark: boolean;

  @Prop({
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  })
  status: string;

  @Prop({
    type: String,
  })
  taskId: string;

  @Prop({
    type: String,
  })
  errorMessage: string;

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

export const VideoSchema = SchemaFactory.createForClass(Video);
