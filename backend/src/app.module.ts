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
import { ReportsModule } from './reports/reports.module';
import { LoginLogsModule } from './login_logs/login_logs.module';
import { TicketsModule } from './tickets/tickets.module';
import { TicketAssignmentsModule } from './ticket_assignments/ticket_assignments.module';
import { TicketWorkLogsModule } from './ticket_work_logs/ticket_work_logs.module';
import { TicketResolutionRequestsModule } from './ticket_resolution_requests/ticket_resolution_requests.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { ReportStatusLogsModule } from './report_status_logs/report_status_logs.module';
import { TicketStatusLogsModule } from './ticket_status_logs/ticket_status_logs.module';
import { ReportConfirmationsModule } from './report_confirmations/report_confirmations.module';
import { ScreeningsModule } from './screenings/screenings.module';
import { UserPortalModule } from './user_portal/user_portal.module';

@Module({
  imports: [
    DatabaseModule,
    CustomersModule,
    StaffsModule,
    TeamsModule,
    RolesModule,
    StaffTeamRolesModule,
    OrganizationsModule,
    SystemsModule,
    ProblemTypesModule,
    ReportsModule,
    LoginLogsModule,
    TicketsModule,
    TicketAssignmentsModule,
    TicketWorkLogsModule,
    TicketResolutionRequestsModule,
    AttachmentsModule,
    ReportStatusLogsModule,
    TicketStatusLogsModule,
    ReportConfirmationsModule,
    ScreeningsModule,
    UserPortalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
