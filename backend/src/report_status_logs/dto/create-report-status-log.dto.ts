export class CreateRequestStatusLogDto {
  reportId!: number;

  oldStatus!: string;

  newStatus!: string;

  changedByType!: string;

  changedById!: number;

  note?: string;
}
