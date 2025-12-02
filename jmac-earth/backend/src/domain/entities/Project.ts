/**
 * =============================================================================
 * PROJECT ENTITY
 * =============================================================================
 * 
 * Represents a complete hydraulic calculation project.
 * 
 * Entity characteristics:
 * - Has identity: Unique ID per project
 * - Aggregate root: Main entity that groups Trace and HydraulicParameters
 * - Domain logic: Project lifecycle, validation, state management
 * - Rich behavior: Manages creation, updates, and calculations
 * 
 * Why an Entity?
 * - Has unique identity (UUID)
 * - Has lifecycle (created, modified, completed)
 * - Manages relationships (owns Trace, parameters, results)
 * - Main aggregate for the bounded context
 * 
 * @module domain/entities
 * =============================================================================
 */

import { Trace } from './Trace';
import { HydraulicParameters } from '../value-objects/HydraulicParameters';

/**
 * Project status
 */
export enum ProjectStatus {
  DRAFT = 'draft',           // Created but not calculated yet
  CALCULATED = 'calculated', // Calculations completed
  IN_EXECUTION = 'in_execution', // Being executed in field (future)
  COMPLETED = 'completed'    // Execution completed (future)
}

/**
 * Source of elevation data
 */
export enum ElevationSource {
  KMZ = 'kmz',   // Elevations came from KMZ file
  API = 'api'    // Elevations obtained from elevation API
}

/**
 * Properties for creating a Project
 */
export interface ProjectProps {
  id: string;                          // UUID
  name: string;                        // Project name
  client?: string;                     // Client name (optional)
  description?: string;                // Project description (optional)
  trace: Trace;                        // The water distribution trace
  hydraulicParameters?: HydraulicParameters;  // Parameters for calculations
  elevationSource: ElevationSource;    // Where elevations came from
  status: ProjectStatus;               // Current project status
  createdAt: Date;                     // Creation timestamp
  updatedAt: Date;                     // Last update timestamp
  createdBy?: string;                  // User ID who created it (future)
}

/**
 * Properties for creating a new Project
 */
export interface CreateProjectProps {
  name: string;
  client?: string;
  description?: string;
  trace: Trace;
  elevationSource: ElevationSource;
  createdBy?: string;
}

/**
 * Project Entity
 * 
 * Main aggregate root for the hydraulic calculation system.
 * Manages trace data, hydraulic parameters, and calculation results.
 */
export class Project {
  private readonly _id: string;
  private _name: string;
  private _client?: string;
  private _description?: string;
  private readonly _trace: Trace;
  private _hydraulicParameters?: HydraulicParameters;
  private readonly _elevationSource: ElevationSource;
  private _status: ProjectStatus;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private readonly _createdBy?: string;

  /**
   * Private constructor to enforce factory pattern
   */
  private constructor(props: ProjectProps) {
    this.validateName(props.name);
    
    this._id = props.id;
    this._name = props.name;
    this._client = props.client;
    this._description = props.description;
    this._trace = props.trace;
    this._hydraulicParameters = props.hydraulicParameters;
    this._elevationSource = props.elevationSource;
    this._status = props.status;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._createdBy = props.createdBy;
  }

  // ===========================================================================
  // FACTORY METHODS
  // ===========================================================================

  /**
   * Create a new Project (draft status)
   * 
   * @param props - Project creation properties
   * @returns New Project instance
   * 
   * @example
   * ```typescript
   * const project = Project.create({
   *   name: "Proyecto Sierra Chata",
   *   client: "Municipalidad",
   *   trace: trace,
   *   elevationSource: ElevationSource.API
   * });
   * 
   * console.log(project.id);           // UUID generated
   * console.log(project.status);       // 'draft'
   * console.log(project.isCalculated); // false
   * ```
   */
  static create(props: CreateProjectProps): Project {
    return new Project({
      id: this.generateId(),
      name: props.name,
      client: props.client,
      description: props.description,
      trace: props.trace,
      hydraulicParameters: undefined,
      elevationSource: props.elevationSource,
      status: ProjectStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: props.createdBy
    });
  }

  /**
   * Reconstitute a Project from persistence
   * 
   * Used when loading from database.
   * 
   * @param props - Complete project properties
   * @returns Project instance
   */
  static reconstitute(props: ProjectProps): Project {
    return new Project(props);
  }

  /**
   * Generate a unique ID for a project
   * 
   * Uses simple UUID v4 generation.
   * In production, consider using a proper UUID library.
   */
  private static generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // ===========================================================================
  // GETTERS (Read-only access)
  // ===========================================================================

  /**
   * Get project ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * Get project name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Get client name
   */
  get client(): string | undefined {
    return this._client;
  }

  /**
   * Get project description
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * Get trace
   */
  get trace(): Trace {
    return this._trace;
  }

  /**
   * Get hydraulic parameters
   */
  get hydraulicParameters(): HydraulicParameters | undefined {
    return this._hydraulicParameters;
  }

  /**
   * Get elevation source
   */
  get elevationSource(): ElevationSource {
    return this._elevationSource;
  }

  /**
   * Get project status
   */
  get status(): ProjectStatus {
    return this._status;
  }

  /**
   * Get creation date
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Get last update date
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Get creator user ID
   */
  get createdBy(): string | undefined {
    return this._createdBy;
  }

  // ===========================================================================
  // STATUS CHECKS
  // ===========================================================================

  /**
   * Check if project is in draft status
   */
  get isDraft(): boolean {
    return this._status === ProjectStatus.DRAFT;
  }

  /**
   * Check if project has been calculated
   */
  get isCalculated(): boolean {
    return this._status === ProjectStatus.CALCULATED ||
           this._status === ProjectStatus.IN_EXECUTION ||
           this._status === ProjectStatus.COMPLETED;
  }

  /**
   * Check if project is ready for calculation
   * 
   * Must have hydraulic parameters set.
   */
  get isReadyForCalculation(): boolean {
    return this._hydraulicParameters !== undefined;
  }

  /**
   * Check if elevations came from KMZ file
   */
  get hasKMZElevations(): boolean {
    return this._elevationSource === ElevationSource.KMZ;
  }

  /**
   * Check if elevations came from API
   */
  get hasAPIElevations(): boolean {
    return this._elevationSource === ElevationSource.API;
  }

  // ===========================================================================
  // DOMAIN BEHAVIOR - Updates
  // ===========================================================================

  /**
   * Update project name
   * 
   * @param name - New project name
   */
  updateName(name: string): void {
    this.validateName(name);
    this._name = name;
    this.touch();
  }

  /**
   * Update client name
   * 
   * @param client - New client name
   */
  updateClient(client: string | undefined): void {
    this._client = client;
    this.touch();
  }

  /**
   * Update description
   * 
   * @param description - New description
   */
  updateDescription(description: string | undefined): void {
    this._description = description;
    this.touch();
  }

  /**
   * Set hydraulic parameters
   * 
   * This prepares the project for calculation.
   * 
   * @param parameters - Hydraulic parameters
   * 
   * @example
   * ```typescript
   * const params = HydraulicParameters.create({
   *   flowRate_m3h: 120,
   *   flexiDiameter: FlexiDiameter.TWELVE_INCH,
   *   pumpingPressure_kgcm2: 8,
   *   numberOfLines: 1,
   *   calculationInterval_m: 50
   * });
   * 
   * project.setHydraulicParameters(params);
   * console.log(project.isReadyForCalculation);  // true
   * ```
   */
  setHydraulicParameters(parameters: HydraulicParameters): void {
    this._hydraulicParameters = parameters;
    this.touch();
  }

  /**
   * Mark project as calculated
   * 
   * Called after hydraulic calculations are completed.
   * 
   * @throws Error if project is not ready for calculation
   */
  markAsCalculated(): void {
    if (!this.isReadyForCalculation) {
      throw new Error('Cannot mark as calculated: hydraulic parameters not set');
    }
    
    this._status = ProjectStatus.CALCULATED;
    this.touch();
  }

  /**
   * Mark project as in execution
   * 
   * Called when field work begins (future feature).
   */
  markAsInExecution(): void {
    if (!this.isCalculated) {
      throw new Error('Cannot mark as in execution: project not calculated');
    }
    
    this._status = ProjectStatus.IN_EXECUTION;
    this.touch();
  }

  /**
   * Mark project as completed
   * 
   * Called when field work is finished (future feature).
   */
  markAsCompleted(): void {
    if (this._status !== ProjectStatus.IN_EXECUTION) {
      throw new Error('Cannot mark as completed: project not in execution');
    }
    
    this._status = ProjectStatus.COMPLETED;
    this.touch();
  }

  /**
   * Update the updatedAt timestamp
   * 
   * Called automatically by update methods.
   */
  private touch(): void {
    this._updatedAt = new Date();
  }

  // ===========================================================================
  // DOMAIN BEHAVIOR - Queries
  // ===========================================================================

  /**
   * Get project summary for display
   * 
   * @returns Summary object with key project info
   */
  getSummary(): {
    id: string;
    name: string;
    client?: string;
    status: ProjectStatus;
    traceDistance_km: number;
    elevationDifference_m: number;
    hasParameters: boolean;
    elevationSource: ElevationSource;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      name: this._name,
      client: this._client,
      status: this._status,
      traceDistance_km: this._trace.totalDistanceKm,
      elevationDifference_m: this._trace.elevationDifference,
      hasParameters: this._hydraulicParameters !== undefined,
      elevationSource: this._elevationSource,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt
    };
  }

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================

  /**
   * Convert to plain object (for JSON serialization)
   * 
   * @returns Plain object with all project data
   */
  toObject(): {
    id: string;
    name: string;
    client?: string;
    description?: string;
    trace: ReturnType<Trace['toObject']>;
    hydraulicParameters?: ReturnType<HydraulicParameters['toObject']>;
    elevationSource: ElevationSource;
    status: ProjectStatus;
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
  } {
    return {
      id: this._id,
      name: this._name,
      client: this._client,
      description: this._description,
      trace: this._trace.toObject(),
      hydraulicParameters: this._hydraulicParameters?.toObject(),
      elevationSource: this._elevationSource,
      status: this._status,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      createdBy: this._createdBy
    };
  }

  /**
   * JSON serialization
   */
  toJSON() {
    return this.toObject();
  }

  /**
   * String representation for debugging
   */
  toString(): string {
    return (
      `Project "${this._name}" ` +
      `(${this._status}, ${this._trace.totalDistanceKm.toFixed(2)}km, ` +
      `${this._trace.pointCount} points)`
    );
  }

  // ===========================================================================
  // VALIDATION (Private)
  // ===========================================================================

  /**
   * Validate project name
   */
  private validateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Project name is required');
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length === 0) {
      throw new Error('Project name cannot be empty');
    }

    if (trimmedName.length < 3) {
      throw new Error('Project name must be at least 3 characters long');
    }

    if (trimmedName.length > 200) {
      throw new Error('Project name must be at most 200 characters long');
    }
  }
}

/**
 * =============================================================================
 * USAGE EXAMPLES
 * =============================================================================
 * 
 * // Creating a new project
 * const trace = Trace.fromCoordinatesAndElevations([...]);
 * 
 * const project = Project.create({
 *   name: "Proyecto Sierra Chata - Rev 1",
 *   client: "Municipalidad de Neuquén",
 *   description: "Distribución de agua para riego",
 *   trace: trace,
 *   elevationSource: ElevationSource.API
 * });
 * 
 * // Project starts in DRAFT status
 * console.log(project.status);           // 'draft'
 * console.log(project.isDraft);          // true
 * console.log(project.isReadyForCalculation);  // false
 * 
 * // Setting hydraulic parameters
 * const params = HydraulicParameters.create({
 *   flowRate_m3h: 120,
 *   flexiDiameter: FlexiDiameter.TWELVE_INCH,
 *   pumpingPressure_kgcm2: 8,
 *   numberOfLines: 1,
 *   calculationInterval_m: 50
 * });
 * 
 * project.setHydraulicParameters(params);
 * console.log(project.isReadyForCalculation);  // true
 * 
 * // After calculations (Sprint 2)
 * project.markAsCalculated();
 * console.log(project.status);           // 'calculated'
 * console.log(project.isCalculated);     // true
 * 
 * // Getting summary
 * const summary = project.getSummary();
 * console.log(summary);
 * // {
 * //   id: "550e8400-e29b-41d4-a716-446655440000",
 * //   name: "Proyecto Sierra Chata - Rev 1",
 * //   client: "Municipalidad de Neuquén",
 * //   status: "calculated",
 * //   traceDistance_km: 5.28,
 * //   elevationDifference_m: -40,
 * //   hasParameters: true,
 * //   elevationSource: "api",
 * //   createdAt: Date,
 * //   updatedAt: Date
 * // }
 * 
 * // Updating project
 * project.updateName("Proyecto Sierra Chata - Rev 2");
 * project.updateClient("Nueva Municipalidad");
 * 
 * // Serialization
 * const json = JSON.stringify(project);
 * 
 * // Reconstitution (from database)
 * const loadedProject = Project.reconstitute({
 *   id: "550e8400-e29b-41d4-a716-446655440000",
 *   name: "Proyecto Sierra Chata",
 *   trace: trace,
 *   elevationSource: ElevationSource.API,
 *   status: ProjectStatus.CALCULATED,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 * 
 * =============================================================================
 */