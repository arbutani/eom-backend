import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { moduleList } from './moduleList';
import { configuration } from './config/configuration';
import { validate } from './config/validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate,
    }),
    ...moduleList,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
