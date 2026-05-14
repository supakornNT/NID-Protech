import { Module } from '@nestjs/common';
import { UserPortalController } from './user_portal.controller';
import { UserPortalService } from './user_portal.service';
import { UserPortalActionService } from './user-portal-action.service';
import { UserPortalMaintenanceService } from './user-portal-maintenance.service';
import { UserPortalQueryService } from './user-portal-query.service';
import { UserPortalRepository } from './user-portal.repository';

@Module({
  controllers: [UserPortalController],
  providers: [
    UserPortalRepository,
    UserPortalMaintenanceService,
    UserPortalQueryService,
    UserPortalActionService,
    UserPortalService,
  ],
})
export class UserPortalModule {}
