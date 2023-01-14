import { User } from '../../src/models/users/interfaces/user.interface';
const USER_1: User = {
    password: 'asdkaXs@3123',
    email: 'email@gmail.com',
};
const USER_2: User = {
    password: 'adasda@Sd3123',
    email: 'email2@email.com',
};

const BAD_USER_3: User = {
    password: 'adasdad3123',
    email: 'email2@emacom',
};
export { USER_1, USER_2, BAD_USER_3 };
