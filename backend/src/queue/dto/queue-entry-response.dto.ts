import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QueueStatus } from '../../common/enums/queue-status.enum';

export class QueueEntryResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  patientId: number;

  @ApiProperty()
  @Expose()
  queueNumber: number;

  @ApiProperty()
  @Expose()
  priority: number;

  @ApiProperty({ enum: QueueStatus })
  @Expose()
  status: QueueStatus;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

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
}
