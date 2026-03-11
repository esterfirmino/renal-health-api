import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../project/project.entity';

@Entity('summaries')
export class Summary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

 @Column({ type: 'uuid' })
  project_id: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({type:'text'})
  meetingTitle:string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'text', default: 'generated' })
  sourceType: string;

  @Column({ type: 'text', nullable: true })
  originalFileName: string;

  @Column({ type: 'text', array: true, nullable: true })
  participants: string[];

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  @CreateDateColumn()
  created_at: Date;
}
