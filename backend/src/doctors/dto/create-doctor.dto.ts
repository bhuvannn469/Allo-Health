import { IsNotEmpty, IsOptional, IsEnum, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({ example: 'Dr. John Smith' })
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: 'Cardiology', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  specialization?: string;

  @ApiProperty({ enum: ['male', 'female', 'other'], required: false })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @ApiProperty({ example: 'Building A, Floor 2', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  location?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  @Length(0, 20)
  phone?: string;

  @ApiProperty({ example: 'Additional notes about the doctor', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
