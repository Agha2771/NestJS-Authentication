import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
  @Prop()
  name: string;

  @Prop({ required: true })
  banner_text: string;

  @Prop({ required: true })
  flash_sales_text: string;

  @Prop({ required: true })
  desktop_banner: string;

  @Prop({ required: true })
  mobile_banner: string;

  @Prop({ required: true })
  flash_image: string;

  @Prop({ required: true })
  start_at: Date;

  @Prop({ required: true })
  end_at: Date;

  @Prop({ default: false })
  is_active: boolean;

  @Prop()
  next_banner_id: string;

  @Prop()
  created_by: string;

  @Prop({ required: true })
  flash_banner_color: string;

  @Prop({ required: true })
  flash_colortimer_color: string;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
