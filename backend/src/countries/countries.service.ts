import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CountryDto, CountryInfoDto } from './dto/create-country.dto';
import { firstValueFrom } from 'rxjs';
import { TypeFlagFields } from 'src/types/countries';
import { iso2ToIso3 } from 'src/utils/iso-mapping';

@Injectable()
export class CountriesService {
  constructor(private readonly httpService: HttpService) {}

  async getAvailableCountries(): Promise<CountryDto[]> {
    const { data } = await firstValueFrom(
      this.httpService.get('https://date.nager.at/api/v3/AvailableCountries'),
    );
    return data;
  }

  async getCountryInfo(countryCode: string): Promise<CountryInfoDto> {
    const iso3Code =
      countryCode.length === 3 ? countryCode : iso2ToIso3[countryCode];
    if (!iso3Code) {
      throw new Error(`ISO3 code not found for country code: ${countryCode}`);
    }

    const [borderData, populationData, flagData] = await Promise.all([
      firstValueFrom(
        this.httpService.get(
          `https://date.nager.at/api/v3/CountryInfo/${iso3Code}`,
        ),
      ),
      firstValueFrom(
        this.httpService.post(
          'https://countriesnow.space/api/v0.1/countries/population',
          {
            iso3: iso3Code,
          },
        ),
      ),
      firstValueFrom(
        this.httpService.get(
          'https://countriesnow.space/api/v0.1/countries/flag/images',
        ),
      ),
    ]);

    return {
      name: borderData.data.commonName,
      countryCode: borderData.data.countryCode,
      borders: borderData.data.borders,
      population: populationData.data.data.populationCounts,
      flagUrl: flagData.data.data.find(
        (f: TypeFlagFields) => f.iso3 === iso3Code,
      )?.flag,
    };
  }
}
