import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import TypeOrmConfig from '../../src/config/configurations/typeorm.config';
import { TypeOrmConfigModule } from '../../src/config/database/postgres/configuration.module';
import { TypeOrmConfigService } from '../../src/config/database/postgres/configuration.service';

import { UserModule } from '../../src//models/users/user.module';
import { UserEntity } from '../../src/models/users/user.entity';

export async function bootstrapTest(): Promise<NestFastifyApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
            UserModule,
            TypeOrmModule.forFeature([UserEntity]),
            TypeOrmModule.forRootAsync({
                imports: [TypeOrmConfigModule],
                useFactory: async (
                    configService: TypeOrmConfigService,
                ): Promise<TypeOrmModuleOptions> =>
                    TypeOrmConfig.getOrmConfig(configService),
                inject: [TypeOrmConfigService],
            }),
        ],
    }).compile();

    return moduleFixture.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter(),
    );
}
