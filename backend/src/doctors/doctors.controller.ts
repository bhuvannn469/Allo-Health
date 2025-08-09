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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { DoctorResponseDto } from './dto/doctor-response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Doctors')
@Controller('doctors')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new doctor' })
  async create(@Body() createDoctorDto: CreateDoctorDto): Promise<DoctorResponseDto> {
    const doctor = await this.doctorsService.create(createDoctorDto);
    return {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      gender: doctor.gender,
      location: doctor.location,
      phone: doctor.phone,
      notes: doctor.notes,
      createdAt: doctor.createdAt,
    };
  }

  @Get()
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all doctors with optional filters' })
  @ApiQuery({ name: 'specialization', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'available_on', required: false, type: String, description: 'Date in YYYY-MM-DD format' })
  async findAll(
    @Query('specialization') specialization?: string,
    @Query('location') location?: string,
    @Query('available_on') availableOn?: string,
  ): Promise<DoctorResponseDto[]> {
    const doctors = await this.doctorsService.findAll(specialization, location, availableOn);
    return doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      gender: doctor.gender,
      location: doctor.location,
      phone: doctor.phone,
      notes: doctor.notes,
      createdAt: doctor.createdAt,
    }));
  }

  @Get(':id')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get doctor by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DoctorResponseDto> {
    const doctor = await this.doctorsService.findOne(id);
    return {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      gender: doctor.gender,
      location: doctor.location,
      phone: doctor.phone,
      notes: doctor.notes,
      createdAt: doctor.createdAt,
    };
  }

  @Patch(':id')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update doctor' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ): Promise<DoctorResponseDto> {
    const doctor = await this.doctorsService.update(id, updateDoctorDto);
    return {
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      gender: doctor.gender,
      location: doctor.location,
      phone: doctor.phone,
      notes: doctor.notes,
      createdAt: doctor.createdAt,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete doctor (Admin only)' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.doctorsService.remove(id);
    return { message: 'Doctor deleted successfully' };
  }
}
