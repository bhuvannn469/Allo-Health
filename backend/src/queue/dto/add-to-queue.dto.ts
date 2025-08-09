import { 
  IsOptional, 
  IsInt, 
  Min, 
  Max, 
  ValidateNested, 
  IsObject 
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreatePatientDto } from '../../patients/dto/create-patient.dto';

export class AddToQueueDto {
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

  @ApiProperty({ 
    example: 1, 
    minimum: 1, 
    maximum: 10, 
    description: 'Priority level (1-10, higher = more urgent)',
    required: false,
    default: 1
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  priority?: number;

  @ApiProperty({ example: 'Walk-in patient with flu symptoms', required: false })
  @IsOptional()
  notes?: string;
}
