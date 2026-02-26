import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class CreateStoryDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsEnum(['童话类', '科普类', '安抚类', '动物类', '自定义类'])
  @IsOptional()
  type?: string;

  @IsEnum(['短款', '中款', '长款'])
  @IsOptional()
  length?: string;

  @IsEnum(['2-4岁', '5-7岁', '7岁以上'])
  @IsOptional()
  ageGroup?: string;

  @IsString()
  @IsOptional()
  thinkingProcess?: string;
}
