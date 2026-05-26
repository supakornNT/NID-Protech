export class CreateRequestStatusLogDto {
  requestId!: number;

  status!: string;

  changedByType!: string;

  changedById!: number;

  note?: string;
}
