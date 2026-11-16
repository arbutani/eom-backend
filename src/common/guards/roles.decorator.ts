/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';
import { usersRole } from '../../enum/users/usersType.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: usersRole[]) => SetMetadata(ROLES_KEY, roles);
