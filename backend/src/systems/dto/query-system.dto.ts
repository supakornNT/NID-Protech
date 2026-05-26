import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

const SYSTEM_STATUS_VALUES = ['active', 'inactive'] as const;

export class SystemQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(SYSTEM_STATUS_VALUES)
  status?: string;
}
