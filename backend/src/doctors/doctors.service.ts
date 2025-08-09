import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const doctor = this.doctorRepository.create(createDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async findAll(
    specialization?: string,
    location?: string,
    availableOn?: string,
  ): Promise<Doctor[]> {
    const query = this.doctorRepository.createQueryBuilder('doctor');

    if (specialization) {
      query.andWhere('doctor.specialization LIKE :specialization', {
        specialization: `%${specialization}%`,
      });
    }

    if (location) {
      query.andWhere('doctor.location LIKE :location', {
        location: `%${location}%`,
      });
    }

    if (availableOn) {
      // Join with availability slots to filter by available date
      query
        .leftJoin('doctor.availabilitySlots', 'slot')
        .andWhere(
          '(slot.date = :date OR (slot.date IS NULL AND slot.dayOfWeek = :dayOfWeek))',
          {
            date: availableOn,
            dayOfWeek: new Date(availableOn).getDay(),
          },
        );
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: ['availabilitySlots'],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    await this.findOne(id); // Verify doctor exists
    await this.doctorRepository.update(id, updateDoctorDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const doctor = await this.findOne(id); // Verify doctor exists
    await this.doctorRepository.remove(doctor);
  }
}
