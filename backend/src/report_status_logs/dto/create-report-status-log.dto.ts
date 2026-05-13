export class CreateRequestStatusLogDto {
  requestId!: number;

  oldStatus!: string;

  newStatus!: string;

  changedByType!: string;

  changedById!: number;

  note?: string;
}
