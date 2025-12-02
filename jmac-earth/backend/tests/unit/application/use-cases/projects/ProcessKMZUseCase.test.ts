import { ProcessKMZUseCase, ProcessKMZPayload } from '@application/use-cases/projects/ProcessKMZUseCase';
import { createDefaultKMZ } from '../../../../fixtures/kmz.fixtures';
import { FlexiDiameter } from '@domain/value-objects/HydraulicParameters';
import { IProjectRepository } from '@domain/repositories/IProjectRepository';
import { Project, ProjectStatus } from '@domain/entities/Project';

class InMemoryProjectRepository implements IProjectRepository {
  private readonly storage = new Map<string, Project>();
  public savedProject?: Project;

  async save(project: Project): Promise<Project> {
    this.storage.set(project.id, project);
    this.savedProject = project;
    return project;
  }

  async findById(id: string): Promise<Project | null> {
    return this.storage.get(id) ?? null;
  }

  async findAll(): Promise<Project[]> {
    return Array.from(this.storage.values());
  }

  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }
}

describe('ProcessKMZUseCase', () => {
  it('creates, calculates and persists a project from a KMZ file', async () => {
    const repository = new InMemoryProjectRepository();
    const useCase = new ProcessKMZUseCase(repository);
    const kmzBuffer = await createDefaultKMZ();

    const payload: ProcessKMZPayload = {
      name: 'Proyecto de prueba',
      client: 'Cliente demo',
      description: 'Prueba de KMZ simple',
      createdBy: 'user-123',
      flowRate_m3h: 120,
      flexiDiameter: FlexiDiameter.TWELVE_INCH,
      pumpingPressure_kgcm2: 8,
      numberOfLines: 1,
      calculationInterval_m: 50
    };

    const result = await useCase.execute(kmzBuffer, payload);

    expect(result.project.name).toBe(payload.name);
    expect(result.project.client).toBe(payload.client);
    expect(result.project.description).toBe(payload.description);
    expect(result.project.status).toBe(ProjectStatus.CALCULATED);
    expect(repository.savedProject).toBe(result.project);
    expect(result.calculation.pumps.length).toBeGreaterThan(0);
    expect(result.calculation.tracePoints?.length).toBeGreaterThan(0);
  });
});
