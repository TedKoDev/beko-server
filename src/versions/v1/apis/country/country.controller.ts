import { Public } from '@/decorators';
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';

@Controller({
  path: 'country',
  version: '1',
})
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Public()
  @Get('list')
  async findAll() {
    try {
      const countries = await this.countryService.findAll();
      return {
        status: 'success',
        data: countries,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Get(':code')
  async findOne(@Param('code') code: string) {
    return this.countryService.findOne(code);
  }

  @Post()
  async create(@Body() createCountryDto: CreateCountryDto) {
    return this.countryService.create(createCountryDto);
  }

  @Delete(':code')
  async remove(@Param('code') code: string) {
    return this.countryService.remove(code);
  }
}
