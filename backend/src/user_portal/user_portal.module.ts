import { Module } from '@nestjs/common';
import { UserPortalController } from './user_portal.controller';
import { UserPortalService } from './user_portal.service';

@Module({
  controllers: [UserPortalController],
  providers: [UserPortalService],
})
export class UserPortalModule {}
