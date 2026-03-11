import { Body, Controller, Delete, Get, HttpCode, Param, Post } from "@nestjs/common";
import { ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ChatService } from "./chat.service";
import { ChatMessageDto } from "./chat.dto";

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post()
    @HttpCode(200)
    @ApiOperation({ summary: 'Enviar mensagem', description: 'Envia uma mensagem para o chat de um projeto e recebe uma resposta' })
    @ApiOkResponse({ description: 'Mensagem enviada e resposta recebida com sucesso' })
    @ApiBadRequestResponse({ description: 'Dados inválidos no corpo da requisição' })
    @ApiNotFoundResponse({ description: 'Projeto não encontrado' })
    @ApiInternalServerErrorResponse({ description: 'Erro ao processar mensagem no servidor' })
    async sendMessage(@Body() chatDto: ChatMessageDto) {
        return await this.chatService.sendMessage(chatDto);
    }

    @Get('conversation/:conversationId')
    @HttpCode(200)
    @ApiOperation({ summary: 'Buscar histórico de conversa', description: 'Retorna o histórico completo de uma conversa pelo ID' })
    @ApiParam({ name: 'conversationId', description: 'ID da conversa', example: '507f1f77bcf86cd799439011' })
    @ApiOkResponse({ description: 'Histórico de conversa retornado com sucesso' })
    @ApiNotFoundResponse({ description: 'Conversa não encontrada' })
    @ApiInternalServerErrorResponse({ description: 'Erro ao buscar histórico de conversa' })
    async getConversationHistory(@Param('conversationId') conversationId: string) {
        return await this.chatService.getConversationHistory(conversationId);
    }

    @Get('project/:project_id')
    @HttpCode(200)
    @ApiOperation({ summary: 'Listar conversas do projeto', description: 'Retorna todas as conversas associadas a um projeto' })
    @ApiParam({ name: 'project_id', description: 'ID do projeto', example: '507f1f77bcf86cd799439011' })
    @ApiOkResponse({ description: 'Lista de conversas retornada com sucesso' })
    @ApiNotFoundResponse({ description: 'Projeto não encontrado' })
    @ApiInternalServerErrorResponse({ description: 'Erro ao buscar conversas do projeto' })
    async getProjectConversations(@Param('project_id') project_id: string) {
        return await this.chatService.getProjectConversations(project_id);
    }

    @Delete('conversation/:conversationId')
    @HttpCode(200)
    @ApiOperation({ summary: 'Deletar conversa', description: 'Remove uma conversa do sistema pelo seu ID' })
    @ApiParam({ name: 'conversationId', description: 'ID da conversa', example: '507f1f77bcf86cd799439011' })
    @ApiOkResponse({ description: 'Conversa deletada com sucesso' })
    @ApiNotFoundResponse({ description: 'Conversa não encontrada' })
    @ApiInternalServerErrorResponse({ description: 'Erro ao deletar conversa' })
    async deleteConversation(@Param('conversationId') conversationId: string) {
        return await this.chatService.deleteConversation(conversationId);
    }
}
