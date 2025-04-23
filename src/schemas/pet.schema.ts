import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PetDocument = Pet & Document;

enum PetMood {
  NEUTRAL = 'NEUTRAL',
  HAPPY = 'HAPPY',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
  HUNGRY = 'HUNGRY',
}

@Schema()
export class Pet {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true, default: 'name' }) 
  name: string;

  @Prop({ required: true, default: PetMood.NEUTRAL })
  mood: PetMood;

  @Prop({ required: true, default: 1 })
  hungryLevel: number;

  @Prop({ required: true, default: 0 })
  typeId: number;

  @Prop({ required: true, default: 0 })
  hatId: number;

  @Prop({ required: true, default: 0 })
  eyesId: number;

  @Prop({ required: true, default: 0 })
  mouthId: number;
}

export const PetSchema = SchemaFactory.createForClass(Pet); 