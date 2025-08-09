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
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Patients')
@Controller('patients')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Create a new patient or return existing by phone',
    description: 'If a patient with the same phone number exists, returns the existing patient instead of creating a duplicate'
  })
  async create(@Body() createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
    const patient = await this.patientsService.create(createPatientDto);
    return {
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      dob: patient.dob,
      notes: patient.notes,
      createdAt: patient.createdAt,
    };
  }

  @Get()
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Search patients by name or phone' })
  @ApiQuery({ name: 'query', required: false, type: String, description: 'Search query for name or phone' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of results to return (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of results to skip (default: 0)' })
  async findAll(
    @Query('query') query?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<PatientResponseDto[]> {
    let patients;
    
    if (query?.trim()) {
      patients = await this.patientsService.search(query);
    } else {
      patients = await this.patientsService.findAll(limit, offset);
    }

    return patients.map(patient => ({
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      dob: patient.dob,
      notes: patient.notes,
      createdAt: patient.createdAt,
    }));
  }

  @Get(':id')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get patient by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PatientResponseDto> {
    const patient = await this.patientsService.findOne(id);
    return {
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      dob: patient.dob,
      notes: patient.notes,
      createdAt: patient.createdAt,
    };
  }

  @Patch(':id')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update patient' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    const patient = await this.patientsService.update(id, updatePatientDto);
    return {
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      dob: patient.dob,
      notes: patient.notes,
      createdAt: patient.createdAt,
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete patient (Admin only)' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.patientsService.remove(id);
    return { message: 'Patient deleted successfully' };
  }
}
