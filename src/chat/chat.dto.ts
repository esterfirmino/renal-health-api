import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NoEmojis } from '../common/validators/no-emojis.validator';

export class ChatMessageDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'ID do projeto',
        example: '507f1f77bcf86cd799439011'
    })
    project_id: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    @NoEmojis()
    @ApiProperty({
        description: 'Mensagem a ser enviada (máximo 100 caracteres)',
        example: 'Qual o status do projeto?',
        maxLength: 100
    })
    message: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'ID da conversa (opcional, para continuar uma conversa existente)',
        example: '507f1f77bcf86cd799439011',
        required: false
    })
    conversationId?: string;
}

export class ChatResponseDto {
    @ApiProperty({ description: 'ID da conversa' })
    conversationId: string;

    @ApiProperty({ description: 'ID do projeto' })
    project_id: string;

    @ApiProperty({ description: 'Mensagem enviada' })
    message: string;

    @ApiProperty({ description: 'Resposta recebida' })
    response: string;

    @ApiProperty({ description: 'Data de criação' })
    created_at: Date;
}
