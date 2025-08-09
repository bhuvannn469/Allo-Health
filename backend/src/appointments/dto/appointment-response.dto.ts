import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';

export class AppointmentResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  patientId: number;

  @ApiProperty()
  @Expose()
  doctorId: number;

  @ApiProperty()
  @Expose()
  scheduledAt: Date;

  @ApiProperty()
  @Expose()
  durationMinutes: number;

  @ApiProperty({ enum: AppointmentStatus })
  @Expose()
  status: AppointmentStatus;

  @ApiProperty()
  @Expose()
  createdBy: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty({ required: false })
  @Expose()
  notes?: string;

  @ApiProperty({ required: false })
  @Expose()
  patient?: {
    id: number;
    name: string;
    phone: string;
  };

  @ApiProperty({ required: false })
  @Expose()
  doctor?: {
    id: number;
    name: string;
    specialization?: string;
  };
}
