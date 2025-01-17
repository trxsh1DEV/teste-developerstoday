import { Controller, Get, Param } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountryDto, CountryInfoDto } from './dto/create-country.dto';

@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  getAvailableCountries(): Promise<CountryDto[]> {
    return this.countriesService.getAvailableCountries();
  }

  @Get(':countryCode')
  getCountryInfo(
    @Param('countryCode') countryCode: string,
  ): Promise<CountryInfoDto> {
    return this.countriesService.getCountryInfo(countryCode);
  }
}
