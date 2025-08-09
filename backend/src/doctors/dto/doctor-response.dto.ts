import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DoctorResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ required: false })
  @Expose()
  specialization?: string;

  @ApiProperty({ enum: ['male', 'female', 'other'], required: false })
  @Expose()
  gender?: string;

  @ApiProperty({ required: false })
  @Expose()
  location?: string;

  @ApiProperty({ required: false })
  @Expose()
  phone?: string;

  @ApiProperty({ required: false })
  @Expose()
  notes?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}
