import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorsRepository: Repository<Doctor>,
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
  ) {}

  async getAnalytics(params: { startDate?: string; endDate?: string } = {}) {
    const now = new Date();
    const startDate = params.startDate ? new Date(params.startDate) : new Date(now.setDate(now.getDate() - 30));
    const endDate = params.endDate ? new Date(params.endDate) : new Date();

    // Basic counts
    const totalPatients = await this.patientsRepository.count();
    const totalDoctors = await this.doctorsRepository.count();
    const totalAppointments = await this.appointmentsRepository.count({
      where: {
        scheduledAt: Between(startDate, endDate),
      },
    });

    // Today's appointments
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const appointmentsToday = await this.appointmentsRepository.count({
      where: {
        scheduledAt: Between(todayStart, todayEnd),
      },
    });

    // Mock data for other analytics
    const averageWaitTime = 15; // minutes
    const patientSatisfaction = 87; // percentage

    // Appointments by month (mock data)
    const appointmentsByMonth = [
      { month: 'Jan', appointments: 125, revenue: 15000 },
      { month: 'Feb', appointments: 140, revenue: 17500 },
      { month: 'Mar', appointments: 160, revenue: 20000 },
      { month: 'Apr', appointments: 135, revenue: 16250 },
      { month: 'May', appointments: 180, revenue: 22500 },
      { month: 'Jun', appointments: 195, revenue: 24375 },
    ];

    // Appointment status distribution (derive from DB inside range); fallback colors
    const rawStatusCounts = await this.appointmentsRepository.createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('a.scheduledAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('a.status')
      .getRawMany<{ status: string; count: string }>();

    const statusColorMap: Record<string, string> = {
      completed: '#10B981',
      booked: '#3B82F6',
      cancelled: '#EF4444',
      'no-show': '#6B7280',
    };

    const appointmentsByStatus = rawStatusCounts.map(r => ({
      status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
      count: parseInt(r.count, 10),
      color: statusColorMap[r.status] || '#3B82F6',
    }));

    // Doctor performance (mock data)
    const doctors = await this.doctorsRepository.find();
    // Compute simple appointment counts per doctor in range
    const doctorCountsRaw = await this.appointmentsRepository.createQueryBuilder('a')
      .select('a.doctorId', 'doctorId')
      .addSelect('COUNT(*)', 'count')
      .where('a.scheduledAt BETWEEN :start AND :end', { start: startDate, end: endDate })
      .groupBy('a.doctorId')
      .getRawMany<{ doctorId: string; count: string }>();
    const doctorCountMap = doctorCountsRaw.reduce<Record<number, number>>((acc, r) => {
      acc[parseInt(r.doctorId, 10)] = parseInt(r.count, 10);
      return acc;
    }, {});
    const doctorPerformance = doctors.slice(0, 5).map(doctor => ({
      name: doctor.name,
      appointments: doctorCountMap[doctor.id] || 0,
      satisfaction: 85, // static placeholder
    }));

    // Queue trends by hour (mock data)
    const queueTrends = [
      { hour: '8:00', queueLength: 2, waitTime: 10 },
      { hour: '9:00', queueLength: 5, waitTime: 20 },
      { hour: '10:00', queueLength: 8, waitTime: 25 },
      { hour: '11:00', queueLength: 12, waitTime: 35 },
      { hour: '12:00', queueLength: 6, waitTime: 15 },
      { hour: '13:00', queueLength: 4, waitTime: 12 },
      { hour: '14:00', queueLength: 9, waitTime: 28 },
      { hour: '15:00', queueLength: 11, waitTime: 32 },
      { hour: '16:00', queueLength: 7, waitTime: 18 },
      { hour: '17:00', queueLength: 3, waitTime: 8 },
    ];

    return {
      totalPatients,
      totalDoctors,
      totalAppointments,
      appointmentsToday,
      averageWaitTime,
      patientSatisfaction,
      appointmentsByMonth,
      appointmentsByStatus,
      doctorPerformance,
      queueTrends,
    };
  }

  async getPatientDemographics() {
    // Mock data for patient demographics
    return {
      ageGroups: [
        { group: '0-18', count: 45 },
        { group: '19-35', count: 120 },
        { group: '36-50', count: 95 },
        { group: '51-65', count: 80 },
        { group: '65+', count: 60 },
      ],
      genderDistribution: [
        { gender: 'Male', count: 180 },
        { gender: 'Female', count: 220 },
      ],
    };
  }

  async getRevenueAnalytics() {
    // Mock revenue data
    return {
      totalRevenue: 125000,
      monthlyRevenue: [
        { month: 'Jan', revenue: 15000 },
        { month: 'Feb', revenue: 17500 },
        { month: 'Mar', revenue: 20000 },
        { month: 'Apr', revenue: 16250 },
        { month: 'May', revenue: 22500 },
        { month: 'Jun', revenue: 24375 },
      ],
      revenueByService: [
        { service: 'Consultation', revenue: 45000 },
        { service: 'Diagnostic', revenue: 30000 },
        { service: 'Treatment', revenue: 35000 },
        { service: 'Follow-up', revenue: 15000 },
      ],
    };
  }
}
