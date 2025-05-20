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

  @Column({ type: 'varchar', length: 70, nullable: true })
  email: string;

  @OneToMany(() => ActiveSessionTracker, (session) => session.user)
  sessions: ActiveSessionTracker[];

  @ManyToMany(() => Role, role => role.users, { nullable: true })
  @JoinTable()
  roles: Role;

  @ManyToMany(() => Permission, permission => permission.users, { nullable: true })
  @JoinTable()
  permissions: Permission[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
