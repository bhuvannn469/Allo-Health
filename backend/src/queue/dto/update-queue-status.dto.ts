import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QueueStatus } from '../../common/enums/queue-status.enum';

export class UpdateQueueStatusDto {
  @ApiProperty({ enum: QueueStatus })
  @IsEnum(QueueStatus)
  status: QueueStatus;

  @ApiProperty({ example: 'Updated status notes', required: false })
  @IsOptional()
  notes?: string;
}
