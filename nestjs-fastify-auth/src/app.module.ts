import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app/configuration.module';

import TypeOrmConfig from './config/configurations/typeorm.config';
import { TypeOrmConfigModule } from './config/database/postgres/configuration.module';
import { TypeOrmConfigService } from './config/database/postgres/configuration.service';

@Module({
    imports: [
        ConfigModule.forRoot(),
        AppConfigModule,
        TypeOrmModule.forRootAsync({
            imports: [TypeOrmConfigModule],
            useFactory: async (
                configService: TypeOrmConfigService,
            ): Promise<TypeOrmModuleOptions> =>
                TypeOrmConfig.getOrmConfig(configService),
            inject: [TypeOrmConfigService],
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
