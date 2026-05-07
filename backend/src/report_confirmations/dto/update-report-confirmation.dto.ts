import { PartialType } from '@nestjs/mapped-types';
import { CreateReportConfirmationDto } from './create-report-confirmation.dto';

export class UpdateReportConfirmationDto extends PartialType(CreateReportConfirmationDto) {}
