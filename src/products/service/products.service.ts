/* eslint-disable prettier/prettier */

import { Injectable } from '@nestjs/common';
import { ErrorMessageService } from '../../shared/services/errormessage.service';
import { productsData, ProductData } from '../data/products.data';

@Injectable()
export class ProductsService {
  constructor(private readonly errorMessageService: ErrorMessageService) {}

  getById(id: number): ProductData {
    const product = productsData[id];
    if (!product) {
      throw this.errorMessageService.GeneralErrorCore(
        `Unknown product_id: ${id}`,
        400,
      );
    }
    return product;
  }

  getMany(ids: number[]): Map<number, ProductData> {
    const uniqueIds = Array.from(new Set(ids));
    const result = new Map<number, ProductData>();

    for (const id of uniqueIds) {
      result.set(id, this.getById(id));
    }

    return result;
  }
}
