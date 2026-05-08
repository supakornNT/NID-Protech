import { PartialType } from '@nestjs/mapped-types';
import { CreateReportStatusLogDto } from './create-report-status-log.dto';

export class UpdateReportStatusLogDto extends PartialType(
  CreateReportStatusLogDto,
) {}
