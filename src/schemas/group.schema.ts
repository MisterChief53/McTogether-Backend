import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema()
export class Group {
  @Prop({ required: true })
  leaderId: string;

  @Prop({ type: [String], default: [] })
  members: string[];

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop({ required: true, enum: ['active', 'disbanded'], default: 'active' })
  status: 'active' | 'disbanded';

  @Prop()
  name?: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group); 