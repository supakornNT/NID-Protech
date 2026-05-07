import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketAssignmentDto } from './create-ticket-assignment.dto';

export class UpdateTicketAssignmentDto extends PartialType(CreateTicketAssignmentDto) {}
