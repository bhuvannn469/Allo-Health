import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AvailabilitySlot } from './entities/availability-slot.entity';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(AvailabilitySlot)
    private readonly availabilityRepository: Repository<AvailabilitySlot>,
  ) {}

  async create(createAvailabilityDto: CreateAvailabilitySlotDto): Promise<AvailabilitySlot> {
    // Validation: Either date or dayOfWeek should be provided, but not both
    if (!createAvailabilityDto.date && createAvailabilityDto.dayOfWeek === undefined) {
      throw new BadRequestException('Either date or dayOfWeek must be provided');
    }

    if (createAvailabilityDto.date && createAvailabilityDto.dayOfWeek !== undefined) {
      throw new BadRequestException('Cannot specify both date and dayOfWeek');
    }

    // Validation: Start time should be before end time
    if (createAvailabilityDto.startTime >= createAvailabilityDto.endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    const slot = this.availabilityRepository.create({
      ...createAvailabilityDto,
      date: createAvailabilityDto.date ? new Date(createAvailabilityDto.date) : null,
    });

    return this.availabilityRepository.save(slot);
  }

  async findByDoctor(doctorId: number): Promise<AvailabilitySlot[]> {
    return this.availabilityRepository.find({
      where: { doctorId },
      order: { date: 'ASC', dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async findOne(id: number): Promise<AvailabilitySlot> {
    const slot = await this.availabilityRepository.findOne({ where: { id } });
    
    if (!slot) {
      throw new NotFoundException('Availability slot not found');
    }

    return slot;
  }

  async remove(id: number): Promise<void> {
    const slot = await this.findOne(id);
    await this.availabilityRepository.remove(slot);
  }
}
