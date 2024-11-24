import { PrismaService } from '@/prisma';
import { Module } from '@nestjs/common';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';

@Module({
  providers: [CountryService, PrismaService],
  controllers: [CountryController],
  exports: [CountryService],
})
export class CountryModule {}
