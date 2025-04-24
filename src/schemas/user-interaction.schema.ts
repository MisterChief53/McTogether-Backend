import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserInteraction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user1: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user2: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  interactionCount: number;

  @Prop({ type: Date })
  lastInteraction: Date;
}

export const UserInteractionSchema = SchemaFactory.createForClass(UserInteraction);

// Create a compound index to ensure unique pairs of users
UserInteractionSchema.index({ user1: 1, user2: 1 }, { unique: true }); 