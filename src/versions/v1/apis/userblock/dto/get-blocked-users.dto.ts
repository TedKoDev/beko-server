import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class GetBlockedUsersDto {
  @IsInt()
  @IsPositive()
  page: number;

  @IsInt()
  @IsPositive()
  limit: number;

  @IsOptional()
  @IsString()
  search?: string; // 검색어를 바탕으로 유저를 찾기 위해 사용
}
