/* eslint-disable prettier/prettier */

import moment from 'moment';
//import * as moment from 'moment';

export class usersDto {
  id: string;
  name: string;
  email: string;
  google_id: string;
  role: 'admin' | 'user' | 'worker';
  is_active: boolean;
  phone: string;
  address_line: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;

  constructor(data: any) {
    data = data.dataValues ? data.dataValues : data;
    this.id = data.id;
    this.name = data.name;
    this.google_id = data.google_id;
    this.email = data.email;
    this.role = data.role;
    this.is_active = data.is_active;
    this.phone = data.phone;
    this.address_line = data.address_line;
    this.landmark = data.landmark;
    this.city = data.city;
    this.state = data.state;
    this.pincode = data.pincode;
    this.latitude = data.latitude == null ? data.latitude : Number(data.latitude);
    this.longitude = data.longitude == null ? data.longitude : Number(data.longitude);

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
