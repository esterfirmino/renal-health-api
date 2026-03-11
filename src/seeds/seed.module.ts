import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../project/project.entity';
import { SeederService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
