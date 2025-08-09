import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AvailabilitySlotResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  doctorId: number;

  @ApiProperty({ required: false })
  @Expose()
  date?: Date;

  @ApiProperty({ required: false, description: '0=Sunday, 1=Monday, ..., 6=Saturday' })
  @Expose()
  dayOfWeek?: number;

  @ApiProperty()
  @Expose()
  startTime: string;

  @ApiProperty()
  @Expose()
  endTime: string;
}
