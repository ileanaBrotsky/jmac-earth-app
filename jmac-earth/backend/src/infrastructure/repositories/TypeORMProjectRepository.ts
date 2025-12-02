/**
 * =============================================================================
 * TYPEORM PROJECT REPOSITORY
 * =============================================================================
 * Implementación de IProjectRepository usando TypeORM.
 *
 * Se encarga de mapear entre la entidad de dominio Project y las tablas
 * projects, traces y trace_points.
 *
 * @module infrastructure/repositories/TypeORMProjectRepository
 * =============================================================================
 */

import { Repository } from 'typeorm';
import AppDataSource from '../database/data-source';
import { ProjectEntity } from '../database/entities/Project.entity';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { Project } from '../../domain/entities/Project';
import { ProjectMapper } from './mappers/ProjectMapper';

export class TypeORMProjectRepository implements IProjectRepository {
  private readonly repository: Repository<ProjectEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(ProjectEntity);
  }

  async save(project: Project): Promise<Project> {
    const entity = ProjectMapper.toPersistence(project);
    const saved = await this.repository.save(entity);
    return ProjectMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Project | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['trace', 'trace.points']
    });

    return entity ? ProjectMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Project[]> {
    const entities = await this.repository.find({
      relations: ['trace', 'trace.points'],
      order: { createdAt: 'DESC' }
    });

    return entities.map(ProjectMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    const result = await this.repository.delete(id);

    if (!result.affected) {
      throw new Error(`Project with id ${id} not found`);
    }
  }
}
