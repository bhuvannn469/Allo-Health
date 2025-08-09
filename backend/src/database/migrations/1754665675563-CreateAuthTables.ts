import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthTables1754665675563 implements MigrationInterface {
    name = 'CreateAuthTables1754665675563'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`queue_entries\` DROP FOREIGN KEY \`FK_queue_entries_patient\``);
        await queryRunner.query(`ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_appointments_created_by\``);
        await queryRunner.query(`ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_appointments_doctor\``);
        await queryRunner.query(`ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_appointments_patient\``);
        await queryRunner.query(`DROP INDEX \`IDX_queue_entries_patient\` ON \`queue_entries\``);
        await queryRunner.query(`DROP INDEX \`IDX_queue_entries_priority\` ON \`queue_entries\``);
        await queryRunner.query(`DROP INDEX \`IDX_queue_entries_queue_number\` ON \`queue_entries\``);
        await queryRunner.query(`DROP INDEX \`IDX_queue_entries_status\` ON \`queue_entries\``);
        await queryRunner.query(`DROP INDEX \`IDX_appointments_doctor_scheduled\` ON \`appointments\``);
        await queryRunner.query(`DROP INDEX \`IDX_appointments_patient\` ON \`appointments\``);
        await queryRunner.query(`DROP INDEX \`IDX_appointments_status\` ON \`appointments\``);
        await queryRunner.query(`CREATE TABLE \`password_reset_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(255) NOT NULL, \`user_id\` int NOT NULL, \`expires_at\` datetime NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`is_used\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_ab673f0e63eac966762155508e\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`refresh_tokens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token\` varchar(255) NOT NULL, \`user_id\` int NOT NULL, \`expires_at\` datetime NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`is_revoked\` tinyint NOT NULL DEFAULT 0, \`device_info\` varchar(255) NULL, UNIQUE INDEX \`IDX_4542dd2f38a61354a040ba9fd5\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`queue_entries\` ADD UNIQUE INDEX \`IDX_7b4e4e1a158243b99a21df62ba\` (\`queue_number\`)`);
        await queryRunner.query(`ALTER TABLE \`queue_entries\` ADD CONSTRAINT \`FK_4ec4c84d20ac8ef55db70270cc0\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_3330f054416745deaa2cc130700\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_4cf26c3f972d014df5c68d503d2\` FOREIGN KEY (\`doctor_id\`) REFERENCES \`doctors\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_d7ca5e722b384f282042d92f4c1\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`password_reset_tokens\` ADD CONSTRAINT \`FK_52ac39dd8a28730c63aeb428c9c\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` ADD CONSTRAINT \`FK_3ddc983c5f7bcf132fd8732c3f4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`refresh_tokens\` DROP FOREIGN KEY \`FK_3ddc983c5f7bcf132fd8732c3f4\``);
        await queryRunner.query(`ALTER TABLE \`password_reset_tokens\` DROP FOREIGN KEY \`FK_52ac39dd8a28730c63aeb428c9c\``);
        await queryRunner.query(`ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_d7ca5e722b384f282042d92f4c1\``);
        await queryRunner.query(`ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_4cf26c3f972d014df5c68d503d2\``);
        await queryRunner.query(`ALTER TABLE \`appointments\` DROP FOREIGN KEY \`FK_3330f054416745deaa2cc130700\``);
        await queryRunner.query(`ALTER TABLE \`queue_entries\` DROP FOREIGN KEY \`FK_4ec4c84d20ac8ef55db70270cc0\``);
        await queryRunner.query(`ALTER TABLE \`queue_entries\` DROP INDEX \`IDX_7b4e4e1a158243b99a21df62ba\``);
        await queryRunner.query(`DROP INDEX \`IDX_4542dd2f38a61354a040ba9fd5\` ON \`refresh_tokens\``);
        await queryRunner.query(`DROP TABLE \`refresh_tokens\``);
        await queryRunner.query(`DROP INDEX \`IDX_ab673f0e63eac966762155508e\` ON \`password_reset_tokens\``);
        await queryRunner.query(`DROP TABLE \`password_reset_tokens\``);
        await queryRunner.query(`CREATE INDEX \`IDX_appointments_status\` ON \`appointments\` (\`status\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_appointments_patient\` ON \`appointments\` (\`patient_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_appointments_doctor_scheduled\` ON \`appointments\` (\`doctor_id\`, \`scheduled_at\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_queue_entries_status\` ON \`queue_entries\` (\`status\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_queue_entries_queue_number\` ON \`queue_entries\` (\`queue_number\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_queue_entries_priority\` ON \`queue_entries\` (\`priority\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_queue_entries_patient\` ON \`queue_entries\` (\`patient_id\`)`);
        await queryRunner.query(`ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_appointments_patient\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_appointments_doctor\` FOREIGN KEY (\`doctor_id\`) REFERENCES \`doctors\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`appointments\` ADD CONSTRAINT \`FK_appointments_created_by\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`queue_entries\` ADD CONSTRAINT \`FK_queue_entries_patient\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patients\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
