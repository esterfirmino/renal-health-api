import { Body, Controller, Post, HttpException, HttpStatus, Get, HttpCode, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator, Patch } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { SummaryService } from "../summary/summary.service";
import { SummaryDto } from "./dto/summary.dto";
import { UploadSummaryDto } from "./dto/upload-summary.dto";
import { MarkdownSummaryDto } from "./dto/markdown-summary.dto";

@ApiTags('Summary')
@Controller('summary')
export class SummaryController {
    constructor(private readonly summaryService: SummaryService) {}

    @Post()
    @HttpCode(200)
    @ApiOperation({ summary: 'Gerar ata de reunião', description: 'Gera uma ata de reunião automaticamente usando IA com base nos dados fornecidos' })
    @ApiOkResponse({ description: 'Ata gerada com sucesso' })
    async generateSummary(@Body() summaryDto: SummaryDto) {
        try {
            const summary = await this.summaryService.generateSummary(summaryDto);
            return {
                success: true,
                data: summary
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get()
    @HttpCode(200)
    @ApiOperation({ summary: 'Listar todas as atas', description: 'Retorna uma lista com todas as atas de reunião cadastradas' })
    @ApiOkResponse({ description: 'Lista de atas retornada com sucesso' })
    async findAllSummary(){
        try {
            return await this.summaryService.findAllSummary();
        } catch (error) {
            throw new Error('Erro ao buscar atas de reunião.');
        }
    }

    @Get(':id')
    @HttpCode(200)
    @ApiOperation({ summary: 'Buscar ata por ID', description: 'Retorna uma ata de reunião específica pelo seu ID' })
    @ApiParam({ name: 'id', description: 'ID da ata', example: '507f1f77bcf86cd799439011' })
    @ApiOkResponse({ description: 'Ata encontrada com sucesso' })
    @ApiNotFoundResponse({ description: 'Ata não encontrada' })
    async findSummaryById(@Param('id') id: string){
        try {
            return await this.summaryService.findSummaryById(id);
        } catch (error) {
            throw new Error('Erro ao buscar ata de reunião.');
        }
    }

    @Delete(':id')
    @HttpCode(200)
    @ApiOperation({ summary: 'Deletar ata', description: 'Remove uma ata de reunião do sistema pelo seu ID' })
    @ApiParam({ name: 'id', description: 'ID da ata', example: '507f1f77bcf86cd799439011' })
    @ApiOkResponse({ description: 'Ata deletada com sucesso' })
    @ApiNotFoundResponse({ description: 'Ata não encontrada' })
    async deleteSummary(@Param('id') id:string){
        try {
            return await this.summaryService.deleteSummary(id);
        } catch (error) {
            throw new Error('Erro ao deletar ata de reunião.');
        }
    }

    @Post('upload')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload de ata', description: 'Faz upload de uma ata de reunião em formato PDF ou DOCX (máximo 10MB)' })
    @ApiConsumes('multipart/form-data')
    @ApiOkResponse({ description: 'Ata enviada com sucesso' })
    async uploadSummary(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /(pdf|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/ }),
                ],
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
        @Body() uploadDto: UploadSummaryDto
    ) {
        try {
            if (!file) {
                throw new Error('Arquivo é obrigatório');
            }
            const summary = await this.summaryService.uploadSummary(file, uploadDto);
            return {success: true,data: summary};
        } catch (error) {
            throw new HttpException(
                {success: false,message: error.message},
                HttpStatus.BAD_REQUEST
            );
        }
    }
    
    @Post('markdown')
    @HttpCode(200)
    @ApiOperation({ summary: 'Criar ata em markdown', description: 'Cria uma ata de reunião diretamente em formato markdown' })
    @ApiCreatedResponse({ description: 'Ata criada com sucesso' })
    async createMarkdown(@Body()  markdownSummary : MarkdownSummaryDto  ){
      try {
        const summary = await this.summaryService.createMarkdownSummary(markdownSummary)
        return {
            success: true,
            data: summary
        }
      } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
      }
    }

    @Get('deleted/all')
    @HttpCode(200)
    @ApiOperation({ summary: 'Listar atas deletadas', description: 'Retorna uma lista com todas as atas de reunião deletadas' })
    @ApiOkResponse({ description: 'Lista de atas deletadas retornada com sucesso' })
    async findAllDeletedSummaries(){
        try {
            return await this.summaryService.findAllDeletedSummaries();
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Patch(':id/restore')
    @HttpCode(200)
    @ApiOperation({ summary: 'Restaurar ata', description: 'Restaura uma ata de reunião deletada pelo seu ID' })
    @ApiParam({ name: 'id', description: 'ID da ata', example: '507f1f77bcf86cd799439011' })
    @ApiOkResponse({ description: 'Ata restaurada com sucesso' })
    @ApiNotFoundResponse({ description: 'Ata não encontrada' })
    async restoreSummary(@Param('id') id: string){
        try {
            const summary = await this.summaryService.restoreSummary(id);
            return {
                success: true,
                data: summary,
                message: 'Ata restaurada com sucesso'
            };
        } catch (error) {
            throw new HttpException(
                {
                    success: false,
                    message: error.message
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
