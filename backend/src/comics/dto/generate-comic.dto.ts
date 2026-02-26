import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GenerateComicDto {
  @IsString()
  @IsNotEmpty()
  storyContent: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  storyId?: string;
}
