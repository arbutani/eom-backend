/* eslint-disable prettier/prettier */
import { Controller, Get, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@Controller('health')
export class HealthController {
  constructor(@Inject(Sequelize) private readonly sequelize: Sequelize) {}

  @Get()
  async health() {
    try {
      await this.sequelize.query('SELECT 1');
    } catch {
      throw new HttpException('database unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
    return { status: 'ok' };
  }

  @Get('live')
  healthLive() {
    return { status: 'ok' };
  }
}
