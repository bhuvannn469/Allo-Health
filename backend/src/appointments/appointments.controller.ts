import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Book a new appointment',
    description: 'Create appointment with existing patient ID or new patient object. Checks for conflicts automatically.'
  })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Request() req,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsService.create(createAppointmentDto, req.user.id);
    return this.mapToResponseDto(appointment);
  }

  @Get()
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get appointments with optional filters' })
  @ApiQuery({ name: 'doctorId', required: false, type: Number })
  @ApiQuery({ name: 'patientId', required: false, type: Number })
  @ApiQuery({ name: 'date', required: false, type: String, description: 'Date in YYYY-MM-DD format' })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of results (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of results to skip (default: 0)' })
  async findAll(
    @Query('doctorId') doctorId?: number,
    @Query('patientId') patientId?: number,
    @Query('date') date?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<AppointmentResponseDto[]> {
    const appointments = await this.appointmentsService.findAll(
      doctorId,
      patientId,
      date,
      status,
      limit,
      offset,
    );

    return appointments.map(appointment => this.mapToResponseDto(appointment));
  }

  @Get(':id')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get appointment by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsService.findOne(id);
    return this.mapToResponseDto(appointment);
  }

  @Patch(':id')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Update appointment (reschedule or change status)',
    description: 'Update appointment details. Rescheduling will check for conflicts.'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsService.update(id, updateAppointmentDto);
    return this.mapToResponseDto(appointment);
  }

  @Delete(':id')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Cancel appointment',
    description: 'Marks appointment as cancelled instead of deleting it'
  })
  async cancel(@Param('id', ParseIntPipe) id: number): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsService.cancel(id);
    return this.mapToResponseDto(appointment);
  }

  private mapToResponseDto(appointment: any): AppointmentResponseDto {
    return {
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      scheduledAt: appointment.scheduledAt,
      durationMinutes: appointment.durationMinutes,
      status: appointment.status,
      createdBy: appointment.createdBy,
      createdAt: appointment.createdAt,
      notes: appointment.notes,
      patient: appointment.patient ? {
        id: appointment.patient.id,
        name: appointment.patient.name,
        phone: appointment.patient.phone,
      } : undefined,
      doctor: appointment.doctor ? {
        id: appointment.doctor.id,
        name: appointment.doctor.name,
        specialization: appointment.doctor.specialization,
      } : undefined,
    };
  }
}
