import { IsOptional, IsString, IsDateString, IsIn, IsMongoId } from 'class-validator';

export class UpdateBannerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  banner_text?: string;

  @IsOptional()
  @IsString()
  flash_sales_text?: string;

  @IsOptional()
  @IsDateString()
  start_time?: string; // Format: ISO 8601 (will be parsed with moment)

  @IsOptional()
  @IsDateString()
  end_time?: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'scheduled'])
  status?: string;

  @IsOptional()
  @IsMongoId()
  next_banner_id?: string;

  @IsOptional()
  @IsString()
  flash_banner_color?: string;

  @IsOptional()
  @IsString()
  flash_colortimer_color?: string;
}
