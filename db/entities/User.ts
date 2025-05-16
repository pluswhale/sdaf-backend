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

  @OneToMany(() => ActiveSessionTracker, (session) => session.user)
  sessions: ActiveSessionTracker[];

  @ManyToOne(() => Role, role => role.users)
  role: Role;

  @ManyToMany(() => Permission, permission => permission.users)
  @JoinTable()
  permissions: Permission[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
