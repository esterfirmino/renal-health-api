import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { Summary } from './summary.entity';
import { Project } from '../project/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Summary, Project]),
  ],
  controllers: [SummaryController],
  providers: [SummaryService],
  exports: [SummaryService],
})
export class SummaryModule {}
