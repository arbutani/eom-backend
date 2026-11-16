/* eslint-disable prettier/prettier */

import { RefreshTokens } from '../entity/refresh_tokens.entity';

export const RefreshTokensProvider = [
  {
    provide: 'REFRESH_TOKENS_REPOSITORY',
    useValue: RefreshTokens,
  },
];
