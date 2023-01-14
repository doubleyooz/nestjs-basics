import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { getConnection } from 'typeorm';
import { createUser } from '../../../helpers/user.helper';

import { bootstrapTest } from '../../../apps/user.app';
import { BAD_USER_3, USER_1, USER_2 } from '../../../mocks/user.mock';

let app: NestFastifyApplication;
const describeif = (condition: boolean) =>
    condition ? describe : describe.skip;
describe('UserController (e2e)', () => {
    beforeAll(async () => {
        app = await bootstrapTest();

        await app.init();
        await app.getHttpAdapter().getInstance().ready();
    });

    afterAll(async () => {
        const entities = getConnection().entityMetadatas;

        for (const entity of entities) {
            const repository = getConnection().getRepository(entity.name); // Get repository
            await repository.clear(); // Clear each entity table's content
        }
        await app.close();
    });
    
    const appWrap = async () => {
        return await app;
    };

    describe('should accept', () => {
        createUser({ ...USER_2, n: 2 }, 'das', 201, appWrap);
    });
    
    describeif(true)('should reject', () => {
        createUser({ ...BAD_USER_3, n: 3 }, 'das', 400, appWrap);
    });
});
