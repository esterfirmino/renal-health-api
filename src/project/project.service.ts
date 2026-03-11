import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProjectRegistrationDto } from "./project-registration.dto";
import { Project } from "./project.entity";

@Injectable()
export class ProjectService {

    constructor(
        @InjectRepository(Project) private readonly projectRepository: Repository<Project>
    ) {}

    async createProject(projectRegistrationDto: ProjectRegistrationDto): Promise<Project> {
        const newProject = this.projectRepository.create(projectRegistrationDto);
        return await this.projectRepository.save(newProject);
    }

    async findAllProjects(): Promise<Project[]>{
        return await this.projectRepository.find({
            where: { isDeleted: false }
        });
    }

    async findProjectById(id: string): Promise<Project> {
        const project = await this.projectRepository.findOneBy({ id });
        if (!project) {
            throw new NotFoundException(`Projeto com ID ${id} não encontrado`);
        }
        return project;
    }

    async deleteProject(id: string) {
        const project = await this.projectRepository.findOneBy({ id });

        if (!project) {
            throw new NotFoundException(`Projeto com ID ${id} não encontrado`);
        }

        if (project.isDeleted) {
            throw new BadRequestException('Projeto já está deletado');
        }

        await this.projectRepository.update(id, {
            isDeleted: true,
            deletedAt: new Date()
        });

        return { message: 'Projeto deletado com sucesso' };
    }

    async findAllDeletedProjects(): Promise<Project[]> {
        return await this.projectRepository.find({
            where: { isDeleted: true },
            order: { deletedAt: 'DESC' }
        });
    }

    async restoreProject(id: string): Promise<Project> {
        const project = await this.projectRepository.findOneBy({ id });

        if (!project) {
            throw new NotFoundException(`Projeto com ID ${id} não encontrado`);
        }

        if (!project.isDeleted) {
            throw new BadRequestException('Projeto não está deletado, não é possível restaurar');
        }

        await this.projectRepository.update(id, {
            isDeleted: false,
            deletedAt: () => 'NULL'
        });

        const restored = await this.projectRepository.findOneBy({ id });
        if (!restored) {
            throw new InternalServerErrorException('Erro ao buscar projeto restaurado');
        }

        return restored;
    }
}
