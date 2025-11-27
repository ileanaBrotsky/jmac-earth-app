import { Project } from '../entities/Project';

/**
 * =============================================================================
 * PROJECT REPOSITORY INTERFACE
 * =============================================================================
 * Contrato para persistir proyectos hidráulicos.
 *
 * Este archivo pertenece a la capa de Dominio y define qué operaciones
 * están disponibles sin atarse a TypeORM ni PostgreSQL.
 *
 * Beneficios:
 * - Inversión de dependencias: la capa de aplicación depende de esta interface
 * - Se puede intercambiar la implementación (TypeORM, Firebase, memoria, etc.)
 * - Facilita los tests con mocks/stubs
 *
 * @module domain/repositories/IProjectRepository
 * =============================================================================
 */
export interface IProjectRepository {
  /**
   * Guardar o actualizar un proyecto
   */
  save(project: Project): Promise<Project>;

  /**
   * Buscar un proyecto por su ID
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Listar todos los proyectos (ordenados por fecha de creación)
   */
  findAll(): Promise<Project[]>;

  /**
   * Eliminar un proyecto por su ID
   */
  delete(id: string): Promise<void>;
}
