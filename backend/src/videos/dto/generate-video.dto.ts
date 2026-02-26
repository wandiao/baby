import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsNumber, IsEnum } from 'class-validator';

export class GenerateVideoDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  referenceUrls: string[];

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsBoolean()
  @IsOptional()
  audio?: boolean;

  @IsString()
  @IsOptional()
  shotType?: string;

  @IsBoolean()
  @IsOptional()
  watermark?: boolean;
}
