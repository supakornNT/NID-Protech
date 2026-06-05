import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CustomersModule } from './customers/customers.module';
import { StaffsModule } from './staffs/staffs.module';
import { TeamsModule } from './teams/teams.module';

import { StaffTeamRolesModule } from './staff_team_roles/staff_team_roles.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { SystemsModule } from './systems/systems.module';
import { ProblemTypesModule } from './problem_types/problem_types.module';
import { RequestsModule } from './requests/requests.module';
import { LoginLogsModule } from './login_logs/login_logs.module';
import { TicketsModule } from './tickets/tickets.module';
import { TicketResolutionRequestsModule } from './ticket_resolution_requests/ticket_resolution_requests.module';
import { RequestStatusLogsModule } from './request_status_logs/request_status_logs.module';
import { TicketStatusLogsModule } from './ticket_status_logs/ticket_status_logs.module';
import { ScreeningsModule } from './screenings/screenings.module';
import { AuthModule } from './auth/auth.module';
import { UserPortalModule } from './user_portal/user_portal.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserPortalModule,
    CustomersModule,
    StaffsModule,
    TeamsModule,
    StaffTeamRolesModule,
    OrganizationsModule,
    SystemsModule,
    ProblemTypesModule,
    RequestsModule,
    LoginLogsModule,
    TicketsModule,
    TicketResolutionRequestsModule,
    RequestStatusLogsModule,
    TicketStatusLogsModule,
    ScreeningsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
