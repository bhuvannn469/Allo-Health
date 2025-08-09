import { 
  IsNotEmpty, 
  IsOptional, 
  IsDateString, 
  IsInt, 
  Min, 
  Max, 
  ValidateNested, 
  IsObject 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreatePatientDto } from '../../patients/dto/create-patient.dto';

export class CreateAppointmentDto {
  @ApiProperty({ example: 1, required: false, description: 'Patient ID (use this OR patient object)' })
  @IsOptional()
  @IsInt()
  patientId?: number;

  @ApiProperty({ 
    type: CreatePatientDto, 
    required: false, 
    description: 'Patient object (use this OR patientId)' 
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreatePatientDto)
  patient?: CreatePatientDto;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  doctorId: number;

  @ApiProperty({ example: '2024-01-15T14:30:00.000Z', description: 'Appointment date and time in ISO format' })
  @IsNotEmpty()
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ example: 30, minimum: 15, maximum: 240 })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(240)
  durationMinutes?: number;

  @ApiProperty({ example: 'Follow-up consultation', required: false })
  @IsOptional()
  notes?: string;
}
