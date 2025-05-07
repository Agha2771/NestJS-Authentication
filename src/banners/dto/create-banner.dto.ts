import {
    IsString, IsOptional, IsDateString, IsIn, IsNumber, IsNotEmpty
  } from 'class-validator';
  
  export class CreateBannerDto {
    @IsOptional()
    @IsString()
    name?: string;
  
    @IsString()
    banner_text: string;
  
    @IsString()
    flash_sales_text: string;
  
    @IsDateString()
    start_time: string;
  
    @IsDateString()
    end_time: string;
  
    @IsOptional()
    @IsIn(['active', 'inactive', 'scheduled'])
    status?: string;
  
    @IsOptional()
    @IsNumber()
    next_banner_id?: number;
  
    @IsString()
    flash_banner_color: string;
  
    @IsString()
    flash_colortimer_color: string;

    @IsOptional()
    desktop_banner: any;

    @IsOptional()
    mobile_banner: any;

    @IsOptional()
    flash_image: any;
  }
  