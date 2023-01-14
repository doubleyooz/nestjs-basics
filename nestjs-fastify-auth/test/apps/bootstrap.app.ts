import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';

export async function bootstrapTest(): Promise<NestFastifyApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    return moduleFixture.createNestApplication<NestFastifyApplication>(
        new FastifyAdapter(),
    );
}
