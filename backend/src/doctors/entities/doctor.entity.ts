import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  specialization: string;

  @Column({ 
    type: 'enum', 
    enum: ['male', 'female', 'other'], 
    nullable: true 
  })
  gender: string;

  @Column({ length: 200, nullable: true })
  location: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany('AvailabilitySlot', 'doctor')
  availabilitySlots: any[];
}
