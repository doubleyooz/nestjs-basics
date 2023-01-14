import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { getConnection } from 'typeorm';
import { createUser, deleteUser } from '../../../helpers/user.helper';

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

    describeif(true)('mock users', () => {
        createUser({ ...USER_2, n: 2 }, 'das', 201, appWrap);
        createUser({ ...USER_1, n: 1 }, 'das', 201, appWrap);
    });

    describe('should accept', () => {
        deleteUser({ ...USER_2, n: 2 }, 'das', 200, appWrap);
        deleteUser({ ...USER_1, n: 1 }, 'das', 200, appWrap);
    });

    describeif(false)('should reject', () => {
        deleteUser({ ...BAD_USER_3, n: 1 }, 'das', 201, appWrap);
    });
});
