import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { QueueStatus } from '../../common/enums/queue-status.enum';

@Entity('queue_entries')
export class QueueEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'patient_id' })
  patientId: number;

  @Column({ name: 'queue_number', unique: true })
  queueNumber: number;

  @Column({ type: 'int', default: 1, comment: 'Higher number = higher priority' })
  priority: number;

  @Column({
    type: 'enum',
    enum: QueueStatus,
    default: QueueStatus.WAITING,
  })
  status: QueueStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne('Patient', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: any;
}
