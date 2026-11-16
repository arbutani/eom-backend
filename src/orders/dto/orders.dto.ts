/* eslint-disable prettier/prettier */

import moment from 'moment';

export class orderItemDto {
  id: string;
  order_id: string;
  product_id: number;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  createdAt: string;
  updatedAt: string;

  constructor(data: any) {
    data = data.dataValues ? data.dataValues : data;
    this.id = data.id;
    this.order_id = data.order_id;
    this.product_id = data.product_id;
    this.product_name = data.product_name;
    this.size = data.size;
    this.quantity = data.quantity;
    this.unit_price =
      data.unit_price == null ? data.unit_price : Number(data.unit_price);
    this.line_total =
      data.line_total == null ? data.line_total : Number(data.line_total);

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

export class ordersDto {
  id: string;
  order_number: string;
  user_id: string | null;
  status: string;
  cancel_reason: string | null;
  customer_name: string;
  customer_phone: string;
  address_type: string;
  address_line: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  policy_accepted: boolean;
  total_amount: number;
  confirmed_at: string | null;
  cancelled_at: string | null;
  createdAt: string;
  updatedAt: string;
  items: orderItemDto[];

  constructor(data: any) {
    data = data.dataValues ? data.dataValues : data;
    this.id = data.id;
    this.order_number = data.order_number;
    this.user_id = data.user_id;
    this.status = data.status;
    this.cancel_reason = data.cancel_reason;
    this.customer_name = data.customer_name;
    this.customer_phone = data.customer_phone;
    this.address_type = data.address_type;
    this.address_line = data.address_line;
    this.landmark = data.landmark;
    this.city = data.city;
    this.state = data.state;
    this.pincode = data.pincode;
    this.latitude =
      data.latitude == null ? data.latitude : Number(data.latitude);
    this.longitude =
      data.longitude == null ? data.longitude : Number(data.longitude);
    this.policy_accepted = data.policy_accepted;
    this.total_amount =
      data.total_amount == null ? data.total_amount : Number(data.total_amount);

    const confirmedAt = data.confirmed_at ? data.confirmed_at : '';
    const cancelledAt = data.cancelled_at ? data.cancelled_at : '';
    this.confirmed_at = confirmedAt
      ? moment(confirmedAt, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY hh:mm A')
      : null;
    this.cancelled_at = cancelledAt
      ? moment(cancelledAt, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY hh:mm A')
      : null;

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

    const items = data.items || [];
    this.items = Array.isArray(items)
      ? items.map((item: any) => new orderItemDto(item))
      : [];
  }
}
