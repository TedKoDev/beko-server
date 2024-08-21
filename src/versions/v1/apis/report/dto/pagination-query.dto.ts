import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export enum ReportSortOrder {
  LATEST = 'latest',
  OLDEST = 'oldest',
}

export class PaginationQueryDto {
  @IsInt()
  @IsPositive()
  page: number;

  @IsInt()
  @IsPositive()
  limit: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ReportSortOrder)
  sortOrder?: ReportSortOrder = ReportSortOrder.LATEST;
}
