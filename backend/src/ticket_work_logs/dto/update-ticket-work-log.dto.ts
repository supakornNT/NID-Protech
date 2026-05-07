import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketWorkLogDto } from './create-ticket-work-log.dto';

export class UpdateTicketWorkLogDto extends PartialType(CreateTicketWorkLogDto) {}
