import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { AvailabilitySlotResponseDto } from './dto/availability-slot-response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Availability')
@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('doctors/:id/availability')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get doctor availability slots' })
  async findByDoctor(
    @Param('id', ParseIntPipe) doctorId: number,
  ): Promise<AvailabilitySlotResponseDto[]> {
    const slots = await this.availabilityService.findByDoctor(doctorId);
    return slots.map(slot => ({
      id: slot.id,
      doctorId: slot.doctorId,
      date: slot.date,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
  }

  @Post('doctors/:id/availability')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create availability slot for doctor' })
  async create(
    @Param('id', ParseIntPipe) doctorId: number,
    @Body() createAvailabilityDto: CreateAvailabilitySlotDto,
  ): Promise<AvailabilitySlotResponseDto> {
    // Override doctorId from URL param
    createAvailabilityDto.doctorId = doctorId;
    
    const slot = await this.availabilityService.create(createAvailabilityDto);
    return {
      id: slot.id,
      doctorId: slot.doctorId,
      date: slot.date,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
    };
  }

  @Delete('availability/:slotId')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete availability slot' })
  async remove(@Param('slotId', ParseIntPipe) slotId: number): Promise<{ message: string }> {
    await this.availabilityService.remove(slotId);
    return { message: 'Availability slot deleted successfully' };
  }
}
