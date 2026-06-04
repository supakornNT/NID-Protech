import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { mkdirSync } from "fs";
import { diskStorage } from "multer";
import { resolve } from "path";
import { normalizeUploadedFileName } from "../common/utils/upload-file-name.util";

import { ConfirmRequestDto } from "./dto/confirm-request.dto";
import { RateRequestDto } from "./dto/rate-request.dto";
import { RejectRequestDto } from "./dto/reject-request.dto";
import type { GetRequestsQuery } from "./interfaces/public-request-list.interface";
import { UserPortalService } from "./user_portal.service";

const uploadDir = resolve(process.cwd(), "..", "uploads", "requests");
mkdirSync(uploadDir, { recursive: true });

const storage = diskStorage({
  destination: uploadDir,
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const originalName = normalizeUploadedFileName(file.originalname);
    file.originalname = originalName;
    cb(null, `${unique}-${originalName}`);
  },
});

@Controller("user")
export class UserPortalController {
  constructor(private readonly userPortalService: UserPortalService) {}

  @Get("dashboard-summary")
  getDashboardSummary(
    @Query("customerId", new ParseIntPipe({ optional: true }))
    customerId?: number,
  ) {
    return this.userPortalService.getDashboardSummary(customerId);
  }

  @Get("requests")
  getRequests(@Query() query: GetRequestsQuery) {
    return this.userPortalService.getRequests(query);
  }

  @Get("requests/track/:requestNo/pdf-data")
  getRequestPdfData(@Param("requestNo") requestNo: string) {
    return this.userPortalService.getRequestPdfData(requestNo);
  }

  @Get("requests/track/:requestNo")
  getRequestTrack(@Param("requestNo") requestNo: string) {
    return this.userPortalService.getRequestTrack(requestNo);
  }

  @Get("requests/:id/repair-attachments")
  getRepairAttachments(@Param("id", ParseIntPipe) id: number) {
    return this.userPortalService.getLatestRepairAttachments(id);
  }

  @Post("requests/:id/confirm")
  confirmRequest(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: ConfirmRequestDto,
  ) {
    return this.userPortalService.confirmRequest(id, body);
  }

  @Post("requests/:id/rating")
  rateRequest(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: RateRequestDto,
  ) {
    return this.userPortalService.rateRequest(id, body);
  }

  @Post("requests/:id/reject")
  @UseInterceptors(FilesInterceptor("files", 10, { storage }))
  rejectRequest(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: RejectRequestDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.userPortalService.rejectRequest(id, body, files ?? []);
  }
}
