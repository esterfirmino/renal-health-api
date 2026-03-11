import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { ChatMessage } from "./chat-message.entity";
import { ChatMessageDto } from "./chat.dto";
import { Summary } from "../summary/summary.entity";
import { Project } from "../project/project.entity";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
    private llmUrl: string;

    constructor(
        @InjectRepository(ChatMessage) private readonly chatMessageRepository: Repository<ChatMessage>,
        @InjectRepository(Summary) private readonly summaryRepository: Repository<Summary>,
        @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
        private readonly configService: ConfigService,
    ) {
        this.llmUrl = this.configService.get<string>('LLM_URL') || 'http://172.18.9.12:11434/api/generate';
    }

    async sendMessage(chatDto: ChatMessageDto): Promise<any> {
        try {
            const conversationId = chatDto.conversationId || uuidv4();

            const project = await this.projectRepository.findOneBy({ id: chatDto.project_id });
            if (!project) {
                throw new Error(`Projeto com ID ${chatDto.project_id} não encontrado`);
            }

            const summaries = await this.summaryRepository.find({
                where: { project_id: chatDto.project_id, isDeleted: false },
                order: { created_at: 'DESC' }
            });

            const conversationHistory = await this.chatMessageRepository.find({
                where: { conversationId },
                order: { created_at: 'ASC' },
                take: 20
            });

            const userMessage = this.chatMessageRepository.create({
                project_id: chatDto.project_id,
                project,
                conversationId,
                role: 'user',
                content: chatDto.message
            });
            await this.chatMessageRepository.save(userMessage);

            const response = await this.callLlmAPI(
                chatDto.message,
                project,
                summaries,
                conversationHistory
            );

            const savedResponse = this.chatMessageRepository.create({
                project_id: chatDto.project_id,
                project,
                conversationId,
                role: 'assistant',
                content: response
            });
            await this.chatMessageRepository.save(savedResponse);

            return {
                conversationId,
                project_id: chatDto.project_id,
                message: chatDto.message,
                response,
                created_at: savedResponse.created_at
            };
        } catch (error) {
            console.error('Erro no chat:', error);
            throw new Error(`Erro ao processar mensagem: ${error.message}`);
        }
    }

    private async callLlmAPI(
        userMessage: string,
        project: Project,
        summaries: Summary[],
        conversationHistory: ChatMessage[]
    ): Promise<string> {
        let atasContext = '';
        if (summaries.length > 0) {
            atasContext = summaries.map((s, index) => {
                const meetingDate = s.date
                    ? new Date(s.date).toLocaleDateString('pt-BR')
                    : 'Data não disponível';
                const meetingTitle = s.meetingTitle || 'Sem título';
                const source = s.sourceType === 'uploaded' ? ` [Upload: ${s.originalFileName || 'arquivo'}]` : '';
                return `
        ATA ${index + 1}: ${meetingTitle} (${meetingDate})${source}
        ${s.summary}
        `;
            }).join('\n');
        } else {
            atasContext = 'Nenhuma ata disponível para este projeto ainda.';
        }

        let historyContext = '';
        if (conversationHistory.length > 0) {
            historyContext = `
        Histórico da conversa:
        ${conversationHistory.map(msg => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`).join('\n')}
        `;
        }

        const prompt = `
        Você é um assistente especializado em responder perguntas sobre atas de reunião de projetos.
        Você tem acesso a todas as atas do projeto e deve responder perguntas baseando-se APENAS nas informações contidas nelas.

        PROJETO: ${project.name}
        DESCRIÇÃO: ${project.description}

        ATAS DISPONÍVEIS:
        ${atasContext}

        ${historyContext}

        INSTRUÇÕES:
        1. Responda APENAS com base nas informações das atas fornecidas
        2. Se a informação não estiver nas atas, informe educadamente que não encontrou essa informação
        3. Seja objetivo e claro nas respostas
        4. Se houver múltiplas referências ao mesmo assunto em diferentes atas, mencione todas
        5. Cite a data da ata quando relevante para a resposta
        6. Use português brasileiro

        PERGUNTA DO USUÁRIO: ${userMessage}

        RESPOSTA:`;

        const response = await fetch(this.llmUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-oss:20b',
                prompt,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`Erro na chamada ao LLM: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    }

    async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
        return await this.chatMessageRepository.find({
            where: { conversationId },
            order: { created_at: 'ASC' }
        });
    }

    async getProjectConversations(project_id: string): Promise<any[]> {
        const conversations = await this.chatMessageRepository
            .createQueryBuilder('msg')
            .select('msg.conversationId', 'conversationId')
            .addSelect('MAX(msg.content)', 'lastMessage')
            .addSelect('MAX(msg.created_at)', 'lastDate')
            .addSelect('COUNT(*)::int', 'messageCount')
            .where('msg.project_id = :project_id', { project_id })
            .groupBy('msg.conversationId')
            .orderBy('"lastDate"', 'DESC')
            .getRawMany();
        return conversations;
    }

    async deleteConversation(conversationId: string): Promise<void> {
        await this.chatMessageRepository.delete({ conversationId });
    }
}
