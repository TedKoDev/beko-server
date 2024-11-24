import { IsString, IsUrl, Length } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @Length(2, 2)
  country_code: string;

  @IsString()
  country_name: string;

  @IsUrl()
  flag_icon: string;
}
