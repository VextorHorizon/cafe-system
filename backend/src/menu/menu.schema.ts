import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MenuItemDocument = HydratedDocument<MenuItem>;

@Schema({ timestamps: true })
export class MenuItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, enum: ['coffee', 'tea', 'other'] })
  category: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);
