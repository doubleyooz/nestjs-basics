import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../database/postgres/configuration.service';

export default class TypeOrmConfig {
    static getOrmConfig(
        configService: TypeOrmConfigService,
    ): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            host: configService.host,
            port: configService.port,
            username: configService.username,
            password: configService.password,
            database: configService.name,
            entities: [
                process.env.NODE_ENV.trim() === 'test'
                    ? 'src/models/**/*.entity.ts'
                    : 'dist/models/**/*.entity.js',
            ],
            synchronize: false,
            logging: true,
            logger: 'file',

            migrations: ['dist/database/migrations/*.js'],

            connectTimeoutMS: 2000,
        };
    }
}
