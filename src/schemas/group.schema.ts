import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema()
export class Group {
  @Prop({ type: [String], default: [] })
  members: string[];

  @Prop({ required: true, default: Date.now })
  createdAt: Date;
}

export const GroupSchema = SchemaFactory.createForClass(Group); 