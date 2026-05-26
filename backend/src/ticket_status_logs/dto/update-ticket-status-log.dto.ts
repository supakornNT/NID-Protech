import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketStatusLogDto } from './create-ticket-status-log.dto';

export class UpdateTicketStatusLogDto extends PartialType(
  CreateTicketStatusLogDto,
) {}
