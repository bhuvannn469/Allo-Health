import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';

describe('AppointmentsService - Conflict Detection', () => {
  let service: AppointmentsService;
  let appointmentRepository: Repository<Appointment>;
  let patientsService: PatientsService;
  let doctorsService: DoctorsService;

  const mockQueryBuilder = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockAppointmentRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockPatientsService = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDoctorsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockAppointmentRepository,
        },
        {
          provide: PatientsService,
          useValue: mockPatientsService,
        },
        {
          provide: DoctorsService,
          useValue: mockDoctorsService,
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    appointmentRepository = module.get<Repository<Appointment>>(getRepositoryToken(Appointment));
    patientsService = module.get<PatientsService>(PatientsService);
    doctorsService = module.get<DoctorsService>(DoctorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAppointmentConflict', () => {
    it('should return false when no conflicts exist', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const hasConflict = await service.checkAppointmentConflict(
        1,
        new Date('2024-01-15T14:00:00Z'),
        30,
      );

      expect(hasConflict).toBe(false);
      expect(mockAppointmentRepository.createQueryBuilder).toHaveBeenCalledWith('appointment');
    });

    it('should return true when overlapping appointment exists', async () => {
      const conflictingAppointment = {
        id: 1,
        doctorId: 1,
        scheduledAt: new Date('2024-01-15T14:15:00Z'),
        durationMinutes: 30,
        status: AppointmentStatus.BOOKED,
      };

      mockQueryBuilder.getOne.mockResolvedValue(conflictingAppointment);

      const hasConflict = await service.checkAppointmentConflict(
        1,
        new Date('2024-01-15T14:00:00Z'),
        30,
      );

      expect(hasConflict).toBe(true);
    });

    it('should exclude specified appointment from conflict check', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);

      await service.checkAppointmentConflict(
        1,
        new Date('2024-01-15T14:00:00Z'),
        30,
        5, // exclude appointment ID 5
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'appointment.id != :excludeAppointmentId',
        { excludeAppointmentId: 5 }
      );
    });
  });

  describe('create', () => {
    beforeEach(() => {
      mockPatientsService.findOne.mockResolvedValue({ id: 1, name: 'John Doe' });
      mockDoctorsService.findOne.mockResolvedValue({ id: 1, name: 'Dr. Smith' });
    });

    it('should create appointment when no conflicts exist', async () => {
      const createDto = {
        patientId: 1,
        doctorId: 1,
        scheduledAt: '2024-01-15T14:00:00Z',
        durationMinutes: 30,
      };

      mockQueryBuilder.getOne.mockResolvedValue(null); // No conflicts
      mockAppointmentRepository.save.mockResolvedValue({
        id: 1,
        ...createDto,
        createdBy: 1,
      });

      const result = await service.create(createDto, 1);

      expect(mockAppointmentRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw ConflictException when overlapping appointment exists', async () => {
      const createDto = {
        patientId: 1,
        doctorId: 1,
        scheduledAt: '2024-01-15T14:00:00Z',
        durationMinutes: 30,
      };

      // Mock conflicting appointment
      mockQueryBuilder.getOne.mockResolvedValue({
        id: 2,
        doctorId: 1,
        scheduledAt: new Date('2024-01-15T14:15:00Z'),
        durationMinutes: 30,
      });

      await expect(service.create(createDto, 1)).rejects.toThrow(ConflictException);
      expect(mockAppointmentRepository.save).not.toHaveBeenCalled();
    });

    it('should create patient if patient object is provided', async () => {
      const createDto = {
        patient: {
          name: 'Jane Doe',
          phone: '+1234567890',
        },
        doctorId: 1,
        scheduledAt: '2024-01-15T14:00:00Z',
      };

      mockPatientsService.create.mockResolvedValue({ id: 2, name: 'Jane Doe' });
      mockQueryBuilder.getOne.mockResolvedValue(null); // No conflicts
      mockAppointmentRepository.save.mockResolvedValue({
        id: 1,
        patientId: 2,
        ...createDto,
        createdBy: 1,
      });

      const result = await service.create(createDto, 1);

      expect(mockPatientsService.create).toHaveBeenCalledWith(createDto.patient);
      expect(mockAppointmentRepository.save).toHaveBeenCalled();
    });
  });
});
