export class CountryDto {
  name: string;
  countryCode: string;
}

export class CountryInfoDto {
  name: string;
  countryCode: string;
  borders: string[];
  population: {
    year: number;
    value: number;
  }[];
  flagUrl: string;
}
