import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('availability_slots')
export class AvailabilitySlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @Column({ type: 'date', nullable: true })
  date: Date;

  @Column({ 
    name: 'day_of_week', 
    type: 'tinyint', 
    nullable: true,
    comment: '0=Sunday, 1=Monday, ..., 6=Saturday' 
  })
  dayOfWeek: number;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @ManyToOne('Doctor', 'availabilitySlots', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: any;
}
