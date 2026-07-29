import { AutoMap } from '@automapper/classes';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export class BaseEntity {
  @AutoMap()
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  public id: string;

  @AutoMap()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', precision: 3 })
  public createdAt: Date;

  @AutoMap()
  @UpdateDateColumn({
    nullable: true,
    name: 'updated_at',
    type: 'timestamptz',
    precision: 3,
  })
  public updatedAt: Date;

  @AutoMap()
  @DeleteDateColumn({
    nullable: true,
    name: 'deleted_at',
    type: 'timestamptz',
    precision: 3,
  })
  public deletedAt: Date;

  @BeforeInsert()
  public beforeInsertEntity() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  public beforeUpdateEntity() {
    this.updatedAt = new Date();
  }
}
