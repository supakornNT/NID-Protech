import { BadRequestException } from '@nestjs/common';
import { ConfirmRequestDto } from '../dto/confirm-request.dto';
import { RateRequestDto } from '../dto/rate-request.dto';
import { RejectRequestDto } from '../dto/reject-request.dto';

export function validateConfirmRequestDto(dto: ConfirmRequestDto): void {
  if (dto.comment !== undefined && typeof dto.comment !== 'string') {
    throw new BadRequestException('comment must be a string');
  }
}

export function validateRateRequestDto(dto: RateRequestDto): void {
  if (!Number.isInteger(dto.score) || dto.score < 1 || dto.score > 5) {
    throw new BadRequestException('score must be an integer between 1 and 5');
  }

  if (dto.comment !== undefined && typeof dto.comment !== 'string') {
    throw new BadRequestException('comment must be a string');
  }
}

export function validateRejectRequestDto(dto: RejectRequestDto): void {
  if (typeof dto.reason !== 'string' || dto.reason.trim().length === 0) {
    throw new BadRequestException('reason is required');
  }
}
