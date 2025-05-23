import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ActiveSessionTracker } from './ActiveSessionTracker';
import { Permission } from './Permission';
import { Role } from './Role';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 256 })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  comment: string;

  @Column({ type: 'varchar', nullable: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  created_at: string;

  @OneToMany(() => ActiveSessionTracker, (session) => session.user, { cascade: false, onDelete: 'SET NULL' })
  sessions: ActiveSessionTracker[];

  @ManyToMany(() => Role, role => role.users, { nullable: true, cascade: false, onDelete: 'CASCADE' })
  @JoinTable()
  roles: Role[];

  @ManyToMany(() => Permission, permission => permission.users, { nullable: true, cascade: false, onDelete: 'CASCADE' })
  @JoinTable()
  permissions: Permission[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
