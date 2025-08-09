import { IsNotEmpty, IsOptional, IsDateString, IsInt, Min, Max, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateAvailabilitySlotDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  doctorId: number;

  @ApiProperty({ example: '2024-01-15', required: false, description: 'Specific date (YYYY-MM-DD) - leave empty for recurring' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 1, required: false, description: '0=Sunday, 1=Monday, ..., 6=Saturday - for recurring slots' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  @Transform(({ value }) => parseInt(value))
  dayOfWeek?: number;

  @ApiProperty({ example: '09:00' })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Start time must be in HH:MM format' })
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'End time must be in HH:MM format' })
  endTime: string;
}
