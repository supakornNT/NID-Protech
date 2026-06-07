import { IsOptional, IsDate, MaxDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTicketDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @MaxDate(() => new Date(), { message: 'dueAt must not be in the future' })
  dueAt?: Date;

  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  note?: string;

  @IsOptional()
  changedBy?: number;
}
