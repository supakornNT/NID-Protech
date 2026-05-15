import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestConfirmationDto } from './create-request-confirmation.dto';

export class UpdateRequestConfirmationDto extends PartialType(
  CreateRequestConfirmationDto,
) {}
