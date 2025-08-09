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
import { QueueService } from './queue.service';
import { AddToQueueDto } from './dto/add-to-queue.dto';
import { UpdateQueueStatusDto } from './dto/update-queue-status.dto';
import { QueueEntryResponseDto } from './dto/queue-entry-response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { QueueStatus } from '../common/enums/queue-status.enum';

@ApiTags('Queue')
@Controller('queue')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Add patient to walk-in queue',
    description: 'Add patient to queue using existing patient ID or new patient object. Auto-assigns queue number.'
  })
  async addToQueue(@Body() addToQueueDto: AddToQueueDto): Promise<QueueEntryResponseDto> {
    const queueEntry = await this.queueService.addToQueue(addToQueueDto);
    return this.mapToResponseDto(queueEntry);
  }

  @Get()
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get queue entries',
    description: 'Returns queue ordered by priority (DESC) then created time (ASC)'
  })
  @ApiQuery({ name: 'status', required: false, enum: QueueStatus, description: 'Filter by queue status' })
  async findAll(@Query('status') status?: QueueStatus): Promise<QueueEntryResponseDto[]> {
    const queueEntries = await this.queueService.findAll(status);
    return queueEntries.map(entry => this.mapToResponseDto(entry));
  }

  @Get('stats')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get queue statistics' })
  async getStats(): Promise<{
    waiting: number;
    withDoctor: number;
    totalToday: number;
    averageWaitTime?: number;
  }> {
    return this.queueService.getQueueStats();
  }

  @Get(':id')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get queue entry by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<QueueEntryResponseDto> {
    const queueEntry = await this.queueService.findOne(id);
    return this.mapToResponseDto(queueEntry);
  }

  @Patch(':id/status')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Update queue entry status',
    description: 'Update status (waiting → with_doctor → completed/skipped)'
  })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateQueueStatusDto,
  ): Promise<QueueEntryResponseDto> {
    const queueEntry = await this.queueService.updateStatus(id, updateStatusDto);
    return this.mapToResponseDto(queueEntry);
  }

  @Patch(':id/skip')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ summary: 'Skip queue entry (marks as skipped)' })
  async skip(@Param('id', ParseIntPipe) id: number): Promise<QueueEntryResponseDto> {
    const queueEntry = await this.queueService.skip(id);
    return this.mapToResponseDto(queueEntry);
  }

  @Delete(':id')
  @Roles(UserRole.FRONTDESK, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Remove entry from queue',
    description: 'Completely removes the queue entry (use skip instead to preserve history)'
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.queueService.remove(id);
    return { message: 'Queue entry removed successfully' };
  }

  private mapToResponseDto(queueEntry: any): QueueEntryResponseDto {
    return {
      id: queueEntry.id,
      patientId: queueEntry.patientId,
      queueNumber: queueEntry.queueNumber,
      priority: queueEntry.priority,
      status: queueEntry.status,
      createdAt: queueEntry.createdAt,
      updatedAt: queueEntry.updatedAt,
      notes: queueEntry.notes,
      patient: queueEntry.patient ? {
        id: queueEntry.patient.id,
        name: queueEntry.patient.name,
        phone: queueEntry.patient.phone,
      } : undefined,
    };
  }
}
