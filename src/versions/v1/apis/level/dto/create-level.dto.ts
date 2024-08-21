import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateOrUpdateLevelThresholdDto {
  @IsInt()
  @IsNotEmpty()
  level: number;

  @IsInt()
  @IsNotEmpty()
  min_posts: number;

  @IsInt()
  @IsNotEmpty()
  min_comments: number;

  @IsInt()
  @IsNotEmpty()
  min_likes: number;

  @IsInt()
  @IsNotEmpty()
  min_logins: number;
}
