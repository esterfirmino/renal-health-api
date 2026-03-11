import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ProjectService } from "./project.service";
import { ProjectRegistrationDto } from "./project-registration.dto";

@ApiTags('Projects')
@Controller('project')
export class ProjectController {
    constructor(readonly projectService: ProjectService) {}

    @Post()
    @HttpCode(201)
    @ApiOperation({ summary: 'Criar novo projeto', description: 'Cria um novo projeto no sistema' })
    @ApiCreatedResponse({ description: 'Projeto criado com sucesso' })
    async createProject(@Body() projectRegistrationDto: ProjectRegistrationDto) {
        return await this.projectService.createProject(projectRegistrationDto);
    }

    @Get()
    @HttpCode(200)
    @ApiOperation({ summary: 'Listar todos os projetos', description: 'Retorna uma lista com todos os projetos cadastrados' })
    @ApiOkResponse({ description: 'Lista de projetos retornada com sucesso' })
    async findAll() {
        return await this.projectService.findAllProjects();
    }
    
    @Get(':id')
    @HttpCode(200)
    @ApiOperation({ summary: 'Buscar projeto por ID', description: 'Retorna um projeto específico pelo seu ID' })
    @ApiParam({ name: 'id', description: 'ID do projeto', example: '507f1f77bcf86cd799439011' })
    @ApiOkResponse({ description: 'Projeto encontrado com sucesso' })
    @ApiNotFoundResponse({ description: 'Projeto não encontrado' })
    async findProjectById(@Param('id') id: string) {
        return await this.projectService.findProjectById(id);
    }

    @Delete(':id')
    @HttpCode(200)
    @ApiOperation({ summary: 'Deletar projeto', description: 'Remove um projeto do sistema pelo seu ID' })
    @ApiParam({ name: 'id', description: 'ID do projeto', example: '507f1f77bcf86cd799439011' })
    @ApiOkResponse({ description: 'Projeto deletado com sucesso' })
    @ApiNotFoundResponse({ description: 'Projeto não encontrado' })
    async deleteProject(@Param('id') id: string) {
        return await this.projectService.deleteProject(id);
    }

    @Get('deleted/all')
    @HttpCode(200)
    @ApiOperation({ summary: 'Listar projetos deletados', description: 'Retorna uma lista com todos os projetos deletados' })
    @ApiOkResponse({ description: 'Lista de projetos deletados retornada com sucesso' })
    async findAllDeleted() {
        return await this.projectService.findAllDeletedProjects();
    }

    @Patch(':id/restore')
    @HttpCode(200)
    @ApiOperation({ summary: 'Restaurar projeto', description: 'Restaura um projeto deletado pelo seu ID' })
    @ApiParam({ name: 'id', description: 'ID do projeto', example: '507f1f77bcf86cd799439011' })
    @ApiOkResponse({ description: 'Projeto restaurado com sucesso' })
    @ApiNotFoundResponse({ description: 'Projeto não encontrado' })
    async restoreProject(@Param('id') id: string) {
        const project = await this.projectService.restoreProject(id);
        return {
            success: true,
            data: project,
            message: 'Projeto restaurado com sucesso'
        };
    }
}
