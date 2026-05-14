import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
=======
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
>>>>>>> origin/create-login

@Module({
  controllers: [RequestsController],
  providers: [RequestsService],
<<<<<<< HEAD
=======
  exports: [RequestsService],
>>>>>>> origin/create-login
})
export class RequestsModule {}
