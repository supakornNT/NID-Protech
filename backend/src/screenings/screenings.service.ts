import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { renderToBuffer } from '@react-pdf/renderer';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import React from 'react';
import * as QRCode from 'qrcode';
import { CreateScreeningDto } from './dto/create-screening.dto';
import { UpdateScreeningDto } from './dto/update-screening.dto';
import type { Screening } from './interfaces/screening.interface';
import { ScreeningPdfDataRow, ScreeningPdfData } from './interfaces/screening-pdf.interface';
import { ScreeningReceiptTemplate } from './templates/screening-receipt.template';

@Injectable()
export class ScreeningsService implements OnModuleInit {
  constructor(@Inject('DB') private readonly db: Pool) {}

  private readonly pdfDir = join(process.cwd(), '..', 'uploads', 'pdf', 'screening');

  onModuleInit() {
    mkdirSync(this.pdfDir, { recursive: true });
  }

  async findAll(): Promise<Screening[]> {
    const [rows] = await this.db.query<Screening[]>(
      `SELECT
      screenings.id,
      screenings.request_id,
      screenings.screened_by,
      screenings.result,
      screenings.note,
      screenings.screened_at
      FROM screenings
      `,
    );

    return rows;
  }

  async findOne(id: number): Promise<Screening | null> {
    const [rows] = await this.db.query<Screening[]>(
      `SELECT
      screenings.id,
      screenings.request_id,
      screenings.screened_by,
      screenings.result,
      screenings.note,
      screenings.screened_at
      FROM screenings
      WHERE screenings.id = ?
      `,
      [id],
    );

    return rows[0] ?? null;
  }

  async findPdfData(requestId: number, staffId: number): Promise<ScreeningPdfData | null> {
    const [rows] = await this.db.query<(ScreeningPdfData & RowDataPacket)[]>(
      `SELECT
        r.id AS requestId,
        r.request_no AS requestNo,
        r.title,
        r.detail,
        r.organization,
        r.created_at AS createdAt,
        CONCAT(c.name, ' ', c.surname) AS customerName,
        c.phone AS customerPhone,
        c.email AS customerEmail,
        CONCAT(s.name, ' ', s.surname) AS staffName,
        pt.name AS problemTypeName,
        sys.name AS systemName
      FROM requests r
      LEFT JOIN customers c ON c.id = r.customer_id
      LEFT JOIN staffs s ON s.id = ?
      LEFT JOIN problem_types pt ON pt.id = r.problem_type_id
      LEFT JOIN systems sys ON sys.id = r.system_id
      WHERE r.id = ?`,
      [staffId, requestId],
    );

    return rows[0] ?? null;
  }

  async generatePdf(data: ScreeningPdfData): Promise<string> {
    const qrDataUrl = await QRCode.toDataURL(data.requestNo);
    const element = React.createElement(
      ScreeningReceiptTemplate,
      { data, qrDataUrl },
    ) as unknown as React.ReactElement<any>;

    const buffer = await renderToBuffer(element);
    const filePath = join(this.pdfDir, `${data.requestId}.pdf`);
    await writeFile(filePath, buffer);

    return filePath;
  }

  async create(dto: CreateScreeningDto): Promise<Screening | null> {
    const [result] = await this.db.query<ResultSetHeader>(
      'INSERT INTO screenings (request_id, screened_by, result, note) VALUES (?, ?, ?, ?)',
      [dto.requestId, dto.screenedBy, dto.result, dto.note],
    );

    if (dto.result === 'accepted' && dto.requestId && dto.screenedBy) {
      try {
        const pdfData = await this.findPdfData(dto.requestId, dto.screenedBy);
        if (pdfData) {
          pdfData.screenedAt = new Date();
          await this.generatePdf(pdfData);
        }
      } catch (err) {
        console.error('[ScreeningsService] PDF generation failed:', err);
      }
    }

    return this.findOne(result.insertId);
  }

  async update(id: number, dto: UpdateScreeningDto): Promise<Screening | null> {
    const current = await this.findOne(id);

    if (!current) {
      return null;
    }

    await this.db.query<ResultSetHeader>(
      `UPDATE screenings
      SET
        request_id = ?,
        screened_by = ?,
        result = ?,
        note = ?
      WHERE id = ?`,
      [
        dto.requestId ?? current.request_id,
        dto.screenedBy ?? current.screened_by,
        dto.result ?? current.result,
        dto.note ?? current.note,
        id,
      ],
    );

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.query<ResultSetHeader>(
      'DELETE FROM screenings WHERE id = ?',
      [id],
    );

    return { message: 'deleted' };
  }
}
