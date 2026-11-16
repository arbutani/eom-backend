/* eslint-disable prettier/prettier */

import { Users } from '../entity/users.entity';

export const UsersProvider = [
  {
    provide: 'USERS_REPOSITORY',
    useValue: Users,
  },
];
