import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { User } from './User';

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string

    @ManyToMany(() => User, user => user.role)
    @JoinTable()
    users: User[];
}
