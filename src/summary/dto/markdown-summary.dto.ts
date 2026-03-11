import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { NoEmojis } from 'src/common/validators/no-emojis.validator';

export class MarkdownSummaryDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'ID do projeto' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    project_id: string;

    @IsNotEmpty()
    @IsString()
    @NoEmojis()
    @MaxLength(100)
    @ApiProperty({ description: 'Título da reunião/ata' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    meetingTitle: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Conteúdo da ata em markdown' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    content: string;
    
    @IsNotEmpty()
    @IsDate()
    @ApiProperty({ description: 'Data da reunião' })
    @Transform(({ value }) => value ? new Date(value) : undefined)
    date: Date;

}
