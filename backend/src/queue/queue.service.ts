import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueEntry } from './entities/queue-entry.entity';
import { AddToQueueDto } from './dto/add-to-queue.dto';
import { UpdateQueueStatusDto } from './dto/update-queue-status.dto';
import { QueueStatus } from '../common/enums/queue-status.enum';
import { PatientsService } from '../patients/patients.service';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(QueueEntry)
    private readonly queueRepository: Repository<QueueEntry>,
    @Inject(forwardRef(() => PatientsService))
    private readonly patientsService: PatientsService,
  ) {}

  async addToQueue(addToQueueDto: AddToQueueDto): Promise<QueueEntry> {
    let patientId: number;

    // Validate that either patientId or patient object is provided
    if (!addToQueueDto.patientId && !addToQueueDto.patient) {
      throw new BadRequestException('Either patientId or patient object must be provided');
    }

    if (addToQueueDto.patientId && addToQueueDto.patient) {
      throw new BadRequestException('Cannot provide both patientId and patient object');
    }

    // Handle patient creation or retrieval
    if (addToQueueDto.patient) {
      const patient = await this.patientsService.create(addToQueueDto.patient);
      patientId = patient.id;
    } else {
      // Verify patient exists
      await this.patientsService.findOne(addToQueueDto.patientId);
      patientId = addToQueueDto.patientId;
    }

    // Check if patient is already in queue with waiting status
    const existingEntry = await this.queueRepository.findOne({
      where: { 
        patientId, 
        status: QueueStatus.WAITING 
      },
    });

    if (existingEntry) {
      throw new BadRequestException('Patient is already in the waiting queue');
    }

    // Generate next queue number
    const queueNumber = await this.generateNextQueueNumber();

    const queueEntry = this.queueRepository.create({
      patientId,
      queueNumber,
      priority: addToQueueDto.priority || 1,
      notes: addToQueueDto.notes,
    });

    return this.queueRepository.save(queueEntry);
  }

  async generateNextQueueNumber(): Promise<number> {
    // Simple running counter implementation
    // For daily reset, you would add date filtering here
    const lastEntry = await this.queueRepository
      .createQueryBuilder('queue')
      .orderBy('queue.queueNumber', 'DESC')
      .getOne();

    return lastEntry ? lastEntry.queueNumber + 1 : 1;

    // TO IMPLEMENT DAILY RESET INSTEAD:
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // const tomorrow = new Date(today);
    // tomorrow.setDate(tomorrow.getDate() + 1);
    //
    // const lastEntry = await this.queueRepository
    //   .createQueryBuilder('queue')
    //   .where('queue.createdAt >= :today AND queue.createdAt < :tomorrow', { today, tomorrow })
    //   .orderBy('queue.queueNumber', 'DESC')
    //   .getOne();
    //
    // return lastEntry ? lastEntry.queueNumber + 1 : 1;
  }

  async findAll(status?: QueueStatus): Promise<QueueEntry[]> {
    const query = this.queueRepository
      .createQueryBuilder('queue')
      .leftJoinAndSelect('queue.patient', 'patient')
      .orderBy('queue.priority', 'DESC')
      .addOrderBy('queue.createdAt', 'ASC');

    if (status) {
      query.where('queue.status = :status', { status });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<QueueEntry> {
    const queueEntry = await this.queueRepository.findOne({
      where: { id },
      relations: ['patient'],
    });

    if (!queueEntry) {
      throw new NotFoundException('Queue entry not found');
    }

    return queueEntry;
  }

  async updateStatus(id: number, updateStatusDto: UpdateQueueStatusDto): Promise<QueueEntry> {
    const queueEntry = await this.findOne(id);

    // Validate status transitions
    if (queueEntry.status === QueueStatus.COMPLETED || queueEntry.status === QueueStatus.SKIPPED) {
      throw new BadRequestException('Cannot update status of completed or skipped entry');
    }

    const updateData = {
      status: updateStatusDto.status,
      notes: updateStatusDto.notes || queueEntry.notes,
    };

    await this.queueRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const queueEntry = await this.findOne(id);
    await this.queueRepository.remove(queueEntry);
  }

  async skip(id: number): Promise<QueueEntry> {
    return this.updateStatus(id, { 
      status: QueueStatus.SKIPPED,
      notes: `Skipped at ${new Date().toLocaleString()}`
    });
  }

  async getQueueStats(): Promise<{
    waiting: number;
    withDoctor: number;
    totalToday: number;
    averageWaitTime?: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [waiting, withDoctor, totalToday] = await Promise.all([
      this.queueRepository.count({ where: { status: QueueStatus.WAITING } }),
      this.queueRepository.count({ where: { status: QueueStatus.WITH_DOCTOR } }),
      this.queueRepository.count({
        where: {
          createdAt: {
            $gte: today,
            $lt: tomorrow,
          } as any,
        },
      }),
    ]);

    return {
      waiting,
      withDoctor,
      totalToday,
      // averageWaitTime calculation would require tracking when patients start being seen
    };
  }
}
