import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CustomersModule } from './customers/customers.module';
import { StaffsModule } from './staffs/staffs.module';
import { TeamsModule } from './teams/teams.module';
import { RolesModule } from './roles/roles.module';
import { StaffTeamRolesModule } from './staff_team_roles/staff_team_roles.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { SystemsModule } from './systems/systems.module';
import { ProblemTypesModule } from './problem_types/problem_types.module';
import { RequestsModule } from './requests/requests.module';
import { LoginLogsModule } from './login_logs/login_logs.module';
import { TicketsModule } from './tickets/tickets.module';
import { TicketAssignmentsModule } from './ticket_assignments/ticket_assignments.module';
import { TicketWorkLogsModule } from './ticket_work_logs/ticket_work_logs.module';
import { TicketResolutionRequestsModule } from './ticket_resolution_requests/ticket_resolution_requests.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { RequestStatusLogsModule } from './request_status_logs/request_status_logs.module';
import { TicketStatusLogsModule } from './ticket_status_logs/ticket_status_logs.module';
import { RequestConfirmationsModule } from './request_confirmations/request_confirmations.module';
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
    RolesModule,
    StaffTeamRolesModule,
    OrganizationsModule,
    SystemsModule,
    ProblemTypesModule,
    RequestsModule,
    LoginLogsModule,
    TicketsModule,
    TicketAssignmentsModule,
    TicketWorkLogsModule,
    TicketResolutionRequestsModule,
    AttachmentsModule,
    RequestStatusLogsModule,
    TicketStatusLogsModule,
    RequestConfirmationsModule,
    ScreeningsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
