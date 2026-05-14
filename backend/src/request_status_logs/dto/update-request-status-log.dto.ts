import { PartialType } from '@nestjs/mapped-types';
import { CreateRequestStatusLogDto } from './create-request-status-log.dto';

export class UpdateRequestStatusLogDto extends PartialType(
  CreateRequestStatusLogDto,
) {}
