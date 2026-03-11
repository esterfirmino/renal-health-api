import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, Max, MaxLength } from 'class-validator';
import { NoEmojis } from '../common/validators/no-emojis.validator';

export class ProjectRegistrationDto {
    @ApiProperty({
        description: 'Nome do projeto',
        example: 'Sistema de Gestão',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    @NoEmojis()
    name: string;

    @ApiProperty({
        description: 'Descrição detalhada do projeto',
        example: 'Sistema para gerenciar tarefas e equipes',
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(160)
    @NoEmojis()
    description: string;

}