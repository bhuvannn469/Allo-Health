import { IsNotEmpty, IsOptional, IsString, Length, IsDateString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  @Matches(/^[+]?[0-9\s\-()]+$/, { message: 'Phone number must be valid' })
  phone: string;

  @ApiProperty({ example: '1990-01-15', required: false, description: 'Date of birth in YYYY-MM-DD format' })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiProperty({ example: 'Patient notes and medical history', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
