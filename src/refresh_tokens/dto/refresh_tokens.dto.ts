/* eslint-disable prettier/prettier */

import moment from 'moment';
//import * as moment from 'moment';

export class refreshTokensDto {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  is_revoked: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(data: any) {
    data = data.dataValues ? data.dataValues : data;
    this.id = data.id;
    this.user_id = data.user_id;
    this.token_hash = data.token_hash;
    this.expires_at = data.expires_at;
    this.is_revoked = data.is_revoked;

    const createdAt = data.createdAt
      ? data.createdAt
      : data.created_at
        ? data.created_at
        : '';
    const updatedAt = data.updatedAt
      ? data.updatedAt
      : data.updated_at
        ? data.updated_at
        : '';
    if (createdAt) {
      this.createdAt = moment(createdAt, 'YYYY-MM-DD HH:mm:ss').format(
        'DD-MM-YYYY hh:mm A',
      );
    }
    if (updatedAt) {
      this.updatedAt = moment(updatedAt, 'YYYY-MM-DD HH:mm:ss').format(
        'DD-MM-YYYY hh:mm A',
      );
    }
  }
}
