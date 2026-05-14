export class CreateRequestConfirmationDto {
  requestId?: number;

  customerId?: number;

  result!: string;

  comment?: string;

  score?: number;
}
