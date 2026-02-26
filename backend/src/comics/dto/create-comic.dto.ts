import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateComicDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  storyContent: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  images: string[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  sceneDescriptions: string[];

  @IsString()
  @IsOptional()
  storyId?: string;
}
