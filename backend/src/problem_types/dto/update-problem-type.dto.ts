import { PartialType } from '@nestjs/mapped-types';
import { CreateProblemTypeDto } from './create-problem-type.dto';

export class UpdateProblemTypeDto extends PartialType(CreateProblemTypeDto) {}
