import { BadRequestException } from '@nestjs/common';
import { ConfirmReportDto } from '../dto/confirm-report.dto';
import { RateReportDto } from '../dto/rate-report.dto';
import { RejectReportDto } from '../dto/reject-report.dto';

export function validateConfirmReportDto(dto: ConfirmReportDto): void {
  if (dto.comment !== undefined && typeof dto.comment !== 'string') {
    throw new BadRequestException('comment must be a string');
  }
}

export function validateRateReportDto(dto: RateReportDto): void {
  if (!Number.isInteger(dto.score) || dto.score < 1 || dto.score > 5) {
    throw new BadRequestException('score must be an integer between 1 and 5');
  }

  if (dto.comment !== undefined && typeof dto.comment !== 'string') {
    throw new BadRequestException('comment must be a string');
  }
}

export function validateRejectReportDto(dto: RejectReportDto): void {
  if (typeof dto.reason !== 'string' || dto.reason.trim().length === 0) {
    throw new BadRequestException('reason is required');
  }
}
