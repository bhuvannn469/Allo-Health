import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../../config/typeorm.config';
import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { Patient } from '../../patients/entities/patient.entity';
import { QueueEntry } from '../../queue/entities/queue-entry.entity';
import { QueueStatus } from '../../common/enums/queue-status.enum';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const userRepository = AppDataSource.getRepository(User);

    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@clinic.com' },
    });

    if (!existingAdmin) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash('admin123', saltRounds);

      const adminUser = userRepository.create({
        name: 'System Admin',
        email: 'admin@clinic.com',
        passwordHash,
        role: UserRole.ADMIN,
      });

      await userRepository.save(adminUser);
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@clinic.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('❌ Admin user already exists');
    }

    // Create a front desk user
    const existingFrontDesk = await userRepository.findOne({
      where: { email: 'frontdesk@clinic.com' },
    });

    if (!existingFrontDesk) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash('frontdesk123', saltRounds);

      const frontDeskUser = userRepository.create({
        name: 'Front Desk Staff',
        email: 'frontdesk@clinic.com',
        passwordHash,
        role: UserRole.FRONTDESK,
      });

      await userRepository.save(frontDeskUser);
      console.log('✅ Front desk user created successfully');
      console.log('📧 Email: frontdesk@clinic.com');
      console.log('🔑 Password: frontdesk123');
    } else {
      console.log('❌ Front desk user already exists');
    }

    // Create sample patients
    const patientRepository = AppDataSource.getRepository(Patient);
    
    const samplePatients = [
      {
        name: 'Alice Johnson',
        phone: '+1234567801',
        dob: new Date('1985-05-15'),
        notes: 'Regular patient with diabetes',
      },
      {
        name: 'Bob Smith',
        phone: '+1234567802',
        dob: new Date('1978-12-03'),
        notes: 'Hypertension patient',
      },
      {
        name: 'Carol Wilson',
        phone: '+1234567803',
        dob: new Date('1992-08-22'),
        notes: 'New patient, no medical history',
      },
    ];

    for (const patientData of samplePatients) {
      const existingPatient = await patientRepository.findOne({
        where: { phone: patientData.phone },
      });

      if (!existingPatient) {
        const patient = patientRepository.create(patientData);
        await patientRepository.save(patient);
        console.log(`✅ Sample patient created: ${patientData.name}`);
      } else {
        console.log(`❌ Patient already exists: ${patientData.name}`);
      }
    }

    // Create sample queue entries
    const queueRepository = AppDataSource.getRepository(QueueEntry);
    
    const sampleQueueEntries = [
      {
        patientId: 1, // Alice Johnson
        queueNumber: 1,
        priority: 2,
        status: QueueStatus.WAITING,
        notes: 'Walk-in for flu symptoms',
      },
      {
        patientId: 2, // Bob Smith
        queueNumber: 2,
        priority: 3,
        status: QueueStatus.WITH_DOCTOR,
        notes: 'Emergency visit for chest pain',
      },
      {
        patientId: 3, // Carol Wilson
        queueNumber: 3,
        priority: 1,
        status: QueueStatus.WAITING,
        notes: 'Routine check-up',
      },
    ];

    for (const queueData of sampleQueueEntries) {
      const existingEntry = await queueRepository.findOne({
        where: { queueNumber: queueData.queueNumber },
      });

      if (!existingEntry) {
        const queueEntry = queueRepository.create(queueData);
        await queueRepository.save(queueEntry);
        console.log(`✅ Sample queue entry created: Queue #${queueData.queueNumber}`);
      } else {
        console.log(`❌ Queue entry already exists: Queue #${queueData.queueNumber}`);
      }
    }

    await AppDataSource.destroy();
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seed();
