import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseModule } from '../database/firebase.module';
import { UsersRepository } from 'src/models/user/user.repository';

@Module({
  imports: [FirebaseModule],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository],
  exports: [AuthService],
})
export class AuthModule {}
