import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { NoEmojis } from '../../common/validators/no-emojis.validator';

export class UploadSummaryDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'ID do projeto',
        example: '507f1f77bcf86cd799439011'
    })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    project_id: string;

    @IsNotEmpty()
    @IsString()
    @NoEmojis()
    @MaxLength(100)
    @ApiProperty({
        description: 'Título da reunião/ata',
        example: 'Reunião de Planejamento Sprint 1'
    })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    meetingTitle: string;

    @IsNotEmpty({ message: 'A data da reunião é obrigatória' })
    @ApiProperty({
        description: 'Data da reunião',
        example: '2024-01-15T10:00:00.000Z'
    })
    @Transform(({ value }) => {
        if (!value) return undefined;
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('Data inválida. Por favor, forneça uma data válida.');
        }
        return date;
    })
    meetingDate: Date;

}
