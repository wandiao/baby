import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  referenceUrls?: string[];

  @IsString()
  @IsOptional()
  taskId?: string;

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

  @IsString()
  @IsOptional()
  status?: string;
}
