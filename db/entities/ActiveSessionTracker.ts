import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User'; // adjust the path

@Entity()
export class ActiveSessionTracker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  loginTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  logoutTime: Date;

  @Column({ type: 'int', nullable: true })
  duration: number; // duration in seconds

  @Column({ type: 'text', nullable: true })
  optionalInfo?: string;

  @ManyToOne(() => User, (user) => user.sessions, { eager: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
