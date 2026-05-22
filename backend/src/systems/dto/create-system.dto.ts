import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const SYSTEM_STATUS_VALUES = ['active', 'inactive'] as const;

export class CreateSystemDto {
  @Transform(({ value, obj }) => value ?? obj.organization_id)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  organizationId!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  @IsIn(SYSTEM_STATUS_VALUES)
  status?: string;
}
