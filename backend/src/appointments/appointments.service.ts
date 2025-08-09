import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @Inject(forwardRef(() => PatientsService))
    private readonly patientsService: PatientsService,
    @Inject(forwardRef(() => DoctorsService))
    private readonly doctorsService: DoctorsService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto, userId: number): Promise<Appointment> {
    let patientId: number;

    // Validate that either patientId or patient object is provided
    if (!createAppointmentDto.patientId && !createAppointmentDto.patient) {
      throw new BadRequestException('Either patientId or patient object must be provided');
    }

    if (createAppointmentDto.patientId && createAppointmentDto.patient) {
      throw new BadRequestException('Cannot provide both patientId and patient object');
    }

    // Handle patient creation or retrieval
    if (createAppointmentDto.patient) {
      const patient = await this.patientsService.create(createAppointmentDto.patient);
      patientId = patient.id;
    } else {
      // Verify patient exists
      await this.patientsService.findOne(createAppointmentDto.patientId);
      patientId = createAppointmentDto.patientId;
    }

    // Verify doctor exists
    await this.doctorsService.findOne(createAppointmentDto.doctorId);

    const scheduledAt = new Date(createAppointmentDto.scheduledAt);
    const durationMinutes = createAppointmentDto.durationMinutes || 30;

    // Check for conflicting appointments
    const hasConflict = await this.checkAppointmentConflict(
      createAppointmentDto.doctorId,
      scheduledAt,
      durationMinutes,
    );

    if (hasConflict) {
      throw new ConflictException(
        `Doctor has a conflicting appointment at ${scheduledAt.toLocaleString()}. Please choose a different time.`,
      );
    }

    const appointment = this.appointmentRepository.create({
      patientId,
      doctorId: createAppointmentDto.doctorId,
      scheduledAt,
      durationMinutes,
      notes: createAppointmentDto.notes,
      createdBy: userId,
    });

    return this.appointmentRepository.save(appointment);
  }

  async checkAppointmentConflict(
    doctorId: number,
    scheduledAt: Date,
    durationMinutes: number,
    excludeAppointmentId?: number,
  ): Promise<boolean> {
    const appointmentStart = scheduledAt;
    const appointmentEnd = new Date(scheduledAt.getTime() + durationMinutes * 60000);

    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.status != :cancelledStatus', { cancelledStatus: AppointmentStatus.CANCELLED })
      .andWhere(
        '(appointment.scheduledAt < :appointmentEnd AND DATE_ADD(appointment.scheduledAt, INTERVAL appointment.durationMinutes MINUTE) > :appointmentStart)',
        {
          appointmentStart,
          appointmentEnd,
        },
      );

    if (excludeAppointmentId) {
      query.andWhere('appointment.id != :excludeAppointmentId', { excludeAppointmentId });
    }

    const conflictingAppointment = await query.getOne();
    return !!conflictingAppointment;
  }

  async findAll(
    doctorId?: number,
    patientId?: number,
    date?: string,
    status?: AppointmentStatus,
    limit = 50,
    offset = 0,
  ): Promise<Appointment[]> {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .orderBy('appointment.scheduledAt', 'ASC');

    if (doctorId) {
      query.andWhere('appointment.doctorId = :doctorId', { doctorId });
    }

    if (patientId) {
      query.andWhere('appointment.patientId = :patientId', { patientId });
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.andWhere('appointment.scheduledAt BETWEEN :startOfDay AND :endOfDay', {
        startOfDay,
        endOfDay,
      });
    }

    if (status) {
      query.andWhere('appointment.status = :status', { status });
    }

    query.take(limit).skip(offset);

    return query.getMany();
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'createdByUser'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // If rescheduling, check for conflicts
    if (updateAppointmentDto.scheduledAt) {
      const newScheduledAt = new Date(updateAppointmentDto.scheduledAt);
      const durationMinutes = updateAppointmentDto.durationMinutes || appointment.durationMinutes;

      const hasConflict = await this.checkAppointmentConflict(
        appointment.doctorId,
        newScheduledAt,
        durationMinutes,
        id, // Exclude current appointment from conflict check
      );

      if (hasConflict) {
        throw new ConflictException(
          `Doctor has a conflicting appointment at ${newScheduledAt.toLocaleString()}. Please choose a different time.`,
        );
      }
    }

    const updateData = {
      ...updateAppointmentDto,
      scheduledAt: updateAppointmentDto.scheduledAt 
        ? new Date(updateAppointmentDto.scheduledAt) 
        : appointment.scheduledAt,
    };

    await this.appointmentRepository.update(id, updateData);
    return this.findOne(id);
  }

  async cancel(id: number): Promise<Appointment> {
    const appointment = await this.findOne(id);
    
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled');
    }

    await this.appointmentRepository.update(id, { 
      status: AppointmentStatus.CANCELLED,
      notes: appointment.notes 
        ? `${appointment.notes}\n\n[CANCELLED at ${new Date().toLocaleString()}]`
        : `[CANCELLED at ${new Date().toLocaleString()}]`
    });
    
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.remove(appointment);
  }
}
