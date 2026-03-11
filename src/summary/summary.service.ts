import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Summary } from "./summary.entity";
import { SummaryDto } from "./dto/summary.dto";
import { UploadSummaryDto } from "./dto/upload-summary.dto";
import { MarkdownSummaryDto } from "./dto/markdown-summary.dto";
import { Project } from "../project/project.entity";
import { PDFParse } from "pdf-parse";
import * as mammoth from "mammoth";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class SummaryService {

    private llmUrl: string;
    private promptTemplate: string;

    constructor(
        @InjectRepository(Summary) private readonly summaryRepository: Repository<Summary>,
        @InjectRepository(Project) private readonly projectRepository: Repository<Project>,
        private readonly configService: ConfigService
    ) {
        this.llmUrl = this.configService.get<string>('LLM_URL') || 'http://172.18.9.12:11434/api/generate';
        this.promptTemplate = fs.readFileSync(
            path.join(__dirname, 'templates/summary-prompt.j2'),
            'utf-8'
        );
    }

    async generateSummary(summaryDto: SummaryDto): Promise<Summary>{
        try {
            const project = await this.projectRepository.findOneBy({ id: summaryDto.project_id });

            if (!project) {
                throw new Error(`Projeto com ID ${summaryDto.project_id} não encontrado`);
            }

            const projectData = {
                name: project.name,
                description: project.description
            };

            const previousSummaries = await this.summaryRepository.find({
                where: {
                    project_id: summaryDto.project_id,
                    isDeleted: false
                },
                order: { created_at: 'DESC' },
                take: 3
            });

            const meetingJson = {
                project_id: summaryDto.project_id,
                meetingTitle: summaryDto.meetingTitle,
                participants: summaryDto.participants,
                date: summaryDto.date,
                topics: summaryDto.topics,
                conclusions: summaryDto.conclusions,
                pending_tasks: summaryDto.pending_tasks,
            }

            const generatedSummary = await this.callLlmAPI(meetingJson, projectData, previousSummaries)

            const newSummary = this.summaryRepository.create({
                project_id: summaryDto.project_id,
                meetingTitle: summaryDto.meetingTitle,
                date: summaryDto.date,
                participants: summaryDto.participants,
                summary: generatedSummary,
                sourceType: 'generated'
            });
            return await this.summaryRepository.save(newSummary);
        } catch (error) {
            console.log(error)
            throw new Error(`Erro ao gerar ata de reunião: ${error.message}`);
        }
    }

    private async callLlmAPI(
        meetingData: any,
        projectData: { name: string; description: string } | null,
        previousSummaries: Summary[]
    ): Promise<string> {
        const projectSection = projectData
            ? `Projeto: ${projectData.name}
Descrição do Projeto: ${projectData.description}

`
            : '';

        let previousSummariesSection = '';
        if (previousSummaries.length > 0) {
            previousSummariesSection = `
Atas Anteriores do Projeto (para contexto e continuidade):
${previousSummaries.map((s, index) => `
--- Ata ${index + 1} ---
${s.summary}
`).join('\n')}

`;
        }

        const participants = Array.isArray(meetingData.participants)
            ? meetingData.participants.join(', ')
            : meetingData.participants;

        const generatedAt = new Date().toLocaleDateString('pt-BR');

        const prompt = this.promptTemplate
            .replace(/{{ projectSection }}/g, projectSection)
            .replace(/{{ date }}/g, meetingData.date)
            .replace(/{{ participants }}/g, participants)
            .replace(/{{ topics }}/g, meetingData.topics)
            .replace(/{{ pending_tasks }}/g, meetingData.pending_tasks)
            .replace(/{{ previousSummariesSection }}/g, previousSummariesSection)
            .replace(/{{ generatedAt }}/g, generatedAt);

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

    async findAllSummary():Promise<Summary[]>{
        try {
            return await this.summaryRepository.find({
                where: { isDeleted: false }
            });
        } catch (error) {
            throw new Error(`Erro ao buscar atas de reunião: ${error.message}`);
        }
    }

    async findSummaryById(id:string):Promise<Summary|null>{
        try {
            const summary = await this.summaryRepository.findOneBy({ id });
            if(!summary){
                throw new Error(`Summary with ID ${id} not found`);
            }
            return summary;
        } catch (error) {
            throw new Error(`Erro ao buscar ata de reunião: ${error.message}`);
        }
    }

    async deleteSummary(id:string):Promise<void>{
        try {
            const summary = await this.summaryRepository.findOneBy({ id });

            if (!summary || summary.isDeleted) {
                return;
            }

            await this.summaryRepository.update(id, {
                isDeleted: true,
                deletedAt: new Date()
            });
        } catch (error) {
            throw new Error(`Erro ao deletar ata de reunião: ${error.message}`);
        }
    }

    async uploadSummary(
        file: Express.Multer.File,
        uploadDto: UploadSummaryDto
    ): Promise<Summary> {
        try {
            const project_id = uploadDto.project_id?.trim();
            const project = await this.projectRepository.findOneBy({ id: project_id });
            if (!project) {
                throw new Error(`Projeto com ID ${project_id} não encontrado`);
            }

            const extractedText = await this.extractTextFromFile(file);

            if (!extractedText || extractedText.trim().length === 0) {
                throw new Error('Não foi possível extrair texto do arquivo');
            }

            const newSummary = this.summaryRepository.create({
                project_id: project_id,
                meetingTitle: uploadDto.meetingTitle,
                date: uploadDto.meetingDate,
                summary: extractedText,
                sourceType: 'uploaded',
                originalFileName: file.originalname,
            });

            return await this.summaryRepository.save(newSummary);
        } catch (error) {
            throw new Error(`Erro ao fazer upload da ata: ${error.message}`);
        }
    }

    private async extractTextFromFile(file: Express.Multer.File): Promise<string> {
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

        switch (fileExtension) {
            case 'pdf':
                return this.extractTextFromPdf(file.buffer);
            case 'docx':
                return this.extractTextFromDocx(file.buffer);
            default:
                throw new Error(`Formato de arquivo não suportado: ${fileExtension}. Use PDF ou DOCX.`);
        }
    }

    private async extractTextFromPdf(buffer: Buffer): Promise<string> {
        const pdf = new PDFParse({ data: buffer });
        const result = await pdf.getText();
        pdf.destroy();
        return result.text;
    }

    private async extractTextFromDocx(buffer: Buffer): Promise<string> {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }

    async createMarkdownSummary(markdownDto: MarkdownSummaryDto): Promise<Summary> {
        try {
            const project_id = markdownDto.project_id?.trim();
            const project = await this.projectRepository.findOneBy({ id: project_id });
            if (!project) {
                throw new Error(`Projeto com ID ${project_id} não encontrado`);
            }

            if (!markdownDto.content || markdownDto.content.trim().length === 0) {
                throw new Error('O conteúdo da ata não pode estar vazio');
            }

            const newSummary = this.summaryRepository.create({
                project_id: project_id,
                meetingTitle: markdownDto.meetingTitle,
                date: markdownDto.date,
                summary: markdownDto.content,
                sourceType: 'markdown',
            });

            return await this.summaryRepository.save(newSummary);
        } catch (error) {
            throw new Error(`Erro ao criar ata markdown: ${error.message}`);
        }
    }

    async findAllDeletedSummaries(): Promise<Summary[]> {
        try {
            return await this.summaryRepository.find({
                where: { isDeleted: true },
                order: { deletedAt: 'DESC' }
            });
        } catch (error) {
            throw new Error(`Erro ao buscar atas deletadas: ${error.message}`);
        }
    }

    async restoreSummary(id: string): Promise<Summary> {
        try {
            const summary = await this.summaryRepository.findOneBy({ id });
            if (!summary) {
                throw new Error(`Ata com ID ${id} não encontrada`);
            }
            if (!summary.isDeleted) {
                throw new Error(`Ata com ID ${id} não está deletada`);
            }
            await this.summaryRepository.update(id, {
                isDeleted: false,
                deletedAt: () => 'NULL'
            });
            const restored = await this.summaryRepository.findOneBy({ id });
            if (!restored) {
                throw new Error(`Erro ao buscar ata restaurada com ID ${id}`);
            }
            return restored;
        } catch (error) {
            throw new Error(`Erro ao restaurar ata de reunião: ${error.message}`);
        }
    }
}
