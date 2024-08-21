import { IsInt, IsNotEmpty } from 'class-validator';

export class GetLevelThresholdDto {
  @IsInt()
  @IsNotEmpty()
  level: number;
}
