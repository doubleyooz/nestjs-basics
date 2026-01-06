import { Module } from '@nestjs/common';
import { CreatorService } from './creator.service';
import { CreatorController } from './creator.controller';
import { CreatorRepository } from './creator.repository';
import { FirebaseModule } from '../../database/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [CreatorController],
  providers: [CreatorService, CreatorRepository],
})
export class CreatorModule {}
