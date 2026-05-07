import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketResolutionRequestDto } from './create-ticket-resolution-request.dto';

export class UpdateTicketResolutionRequestDto extends PartialType(CreateTicketResolutionRequestDto) {}
