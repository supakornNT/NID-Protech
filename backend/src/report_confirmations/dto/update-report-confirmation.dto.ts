import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestConfirmationDto } from './create-report-confirmation.dto';

export class UpdateRequestConfirmationDto extends PartialType(CreateRequestConfirmationDto) {}
