import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class CreatePostDto {
  @IsArray()
  @IsNotEmpty()
  images: string[];

  @IsString()
  @IsNotEmpty()
  caption: string;
}