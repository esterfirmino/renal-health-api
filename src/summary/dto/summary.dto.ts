import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty,  IsString, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { NoEmojis } from '../../common/validators/no-emojis.validator';

export class SummaryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'ID do projeto',
    example: '507f1f77bcf86cd799439011',
  })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  project_id: string;

  @IsNotEmpty()
  @IsString()
  @NoEmojis()
  @MaxLength(100)
  @ApiProperty({
    description: 'Título da reunião/ata',
    example: 'Reunião de Planejamento Sprint 1',
  })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  meetingTitle: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: 'Data da reunião',
    example: '2024-01-15T10:00:00.000Z',
  })
  date: Date
  
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @MaxLength(20, { each: true })
  @NoEmojis()
  @ApiProperty({ description: 'Participantes da reunião' })
  @Transform(({ value }) => Array.isArray(value) ? value.map(v => typeof v === 'string' ? v.trim() : v) : value)
  participants: string[];

  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  @NoEmojis()
  @ApiProperty({ description: 'Tópicos discutidos na reunião' })
  @Transform(({ value }) => Array.isArray(value) ? value.map(v => typeof v === 'string' ? v.trim() : v) : value)
  topics: string[];

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  @NoEmojis()
  @ApiProperty({ description: 'Conclusões da reunião' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  conclusions: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  @NoEmojis()
  @ApiProperty({ description: 'Tarefas pendentes' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  pending_tasks: string;
}
