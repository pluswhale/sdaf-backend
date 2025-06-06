import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { User } from './User';

@Entity()
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    category: string;

    @ManyToMany(() => User, user => user.permissions, { nullable: true, cascade: false, onDelete: 'CASCADE', })
    users: User[];
}