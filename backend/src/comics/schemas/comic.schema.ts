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
export class Comic extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Story',
  })
  storyId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  storyContent: string;

  @Prop({
    type: [String],
    required: true,
  })
  images: string[];

  @Prop({
    type: [String],
    required: true,
  })
  sceneDescriptions: string[];

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

export const ComicSchema = SchemaFactory.createForClass(Comic);
