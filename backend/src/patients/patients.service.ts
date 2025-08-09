import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    // Check if patient already exists by phone number
    const existingPatient = await this.findByPhone(createPatientDto.phone);
    
    if (existingPatient) {
      // Return existing patient instead of creating duplicate
      return existingPatient;
    }

    const patient = this.patientRepository.create({
      ...createPatientDto,
      dob: createPatientDto.dob ? new Date(createPatientDto.dob) : null,
    });

    return this.patientRepository.save(patient);
  }

  async findByPhone(phone: string): Promise<Patient | null> {
    return this.patientRepository.findOne({ where: { phone } });
  }

  async findOne(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async search(query: string): Promise<Patient[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchQuery = `%${query.trim()}%`;

    return this.patientRepository.find({
      where: [
        { name: Like(searchQuery) },
        { phone: Like(searchQuery) },
      ],
      order: { name: 'ASC' },
      take: 50, // Limit results
    });
  }

  async update(id: number, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);

    // Check if phone number is being changed and if it conflicts with existing patient
    if (updatePatientDto.phone && updatePatientDto.phone !== patient.phone) {
      const existingPatient = await this.findByPhone(updatePatientDto.phone);
      if (existingPatient) {
        throw new ConflictException('Phone number already exists');
      }
    }

    const updateData = {
      ...updatePatientDto,
      dob: updatePatientDto.dob ? new Date(updatePatientDto.dob) : patient.dob,
    };

    await this.patientRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);
  }

  async findAll(limit = 50, offset = 0): Promise<Patient[]> {
    return this.patientRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}
