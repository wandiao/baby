import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdatePostDto {
  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  caption?: string;
}