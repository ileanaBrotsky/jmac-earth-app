/**
 * =============================================================================
 * ELEVATION SERVICE FACTORY
 * =============================================================================
 * 
 * Factory pattern for creating elevation service instances.
 * 
 * Responsibilities:
 * - Create the appropriate elevation service based on configuration
 * - Centralize service instantiation
 * - Allow easy switching between providers
 * 
 * Supported providers:
 * - opentopo: OpenTopoData (Copernicus DEM) - Default, FREE
 * - google: Google Elevation API - Paid, higher precision
 * - mock: Mock service for testing - No API calls
 * 
 * Configuration via environment variable:
 * ELEVATION_PROVIDER=opentopo|google|mock
 * 
 * @module infrastructure/services/elevation
 * =============================================================================
 */

import { IElevationService } from '../../../domain/interfaces/IElevationService';
import { OpenTopoDataService } from './OpenTopoDataService';

/**
 * Supported elevation service providers
 */
export enum ElevationProvider {
  OPENTOPO = 'opentopo',
  GOOGLE = 'google',
  MOCK = 'mock'
}

/**
 * Elevation Service Factory
 * 
 * Creates elevation service instances based on configuration.
 * This is the ONLY place where we decide which implementation to use.
 */
export class ElevationServiceFactory {
  /**
   * Create an elevation service instance
   * 
   * Reads configuration from environment variable ELEVATION_PROVIDER.
   * Falls back to OpenTopoData if not specified or invalid.
   * 
   * @returns IElevationService instance
   * @throws Error if required configuration is missing (e.g., Google API key)
   * 
   * @example
   * ```typescript
   * // Using default (OpenTopoData)
   * const service = ElevationServiceFactory.create();
   * 
   * // Using specific provider
   * process.env.ELEVATION_PROVIDER = 'opentopo';
   * const service = ElevationServiceFactory.create();
   * 
   * // For testing
   * process.env.ELEVATION_PROVIDER = 'mock';
   * const service = ElevationServiceFactory.create();
   * ```
   */
  static create(): IElevationService {
    const provider = this.getProvider();

    switch (provider) {
      case ElevationProvider.OPENTOPO:
        return this.createOpenTopoService();

      case ElevationProvider.GOOGLE:
        return this.createGoogleService();

      case ElevationProvider.MOCK:
        return this.createMockService();

      default:
        console.warn(
          `Unknown elevation provider: "${provider}". Using OpenTopoData as default.`
        );
        return this.createOpenTopoService();
    }
  }

  /**
   * Create OpenTopoData service
   * 
   * @returns OpenTopoDataService instance
   */
  private static createOpenTopoService(): IElevationService {
    console.log('✅ Using OpenTopoData elevation service (Copernicus DEM, ±10m precision)');
    return new OpenTopoDataService();
  }

  /**
   * Create Google Elevation API service
   * 
   * Requires GOOGLE_ELEVATION_API_KEY environment variable.
   * 
   * @returns GoogleElevationService instance
   * @throws Error if API key is not configured
   */
  private static createGoogleService(): IElevationService {
    const apiKey = process.env.GOOGLE_ELEVATION_API_KEY;

    if (!apiKey) {
      throw new Error(
        'Google Elevation API selected but GOOGLE_ELEVATION_API_KEY is not configured. ' +
        'Please set the environment variable or use a different provider.'
      );
    }

    console.log('✅ Using Google Elevation API (±30m precision)');
    
    // TODO: Implement GoogleElevationService in Sprint 2+
    throw new Error(
      'Google Elevation API service not yet implemented. ' +
      'Use "opentopo" provider for now.'
    );
  }

  /**
   * Create Mock service for testing
   * 
   * Returns mock elevations without making API calls.
   * Useful for unit tests and development.
   * 
   * @returns MockElevationService instance
   */
  private static createMockService(): IElevationService {
    console.log('✅ Using Mock elevation service (testing mode)');
    
    // TODO: Implement MockElevationService
    throw new Error(
      'Mock elevation service not yet implemented. ' +
      'Use "opentopo" provider for now.'
    );
  }

  /**
   * Get provider from environment variable
   * 
   * @returns ElevationProvider enum value
   */
  private static getProvider(): ElevationProvider {
    const providerEnv = process.env.ELEVATION_PROVIDER?.toLowerCase();

    if (!providerEnv) {
      return ElevationProvider.OPENTOPO; // Default
    }

    // Validate provider
    const validProviders = Object.values(ElevationProvider);
    
    if (validProviders.includes(providerEnv as ElevationProvider)) {
      return providerEnv as ElevationProvider;
    }

    console.warn(
      `Invalid ELEVATION_PROVIDER: "${providerEnv}". ` +
      `Valid options: ${validProviders.join(', ')}. ` +
      `Using default: ${ElevationProvider.OPENTOPO}`
    );

    return ElevationProvider.OPENTOPO;
  }

  /**
   * Get list of supported providers
   * 
   * @returns Array of supported provider names
   */
  static getSupportedProviders(): string[] {
    return Object.values(ElevationProvider);
  }

  /**
   * Check if a provider is supported
   * 
   * @param provider - Provider name to check
   * @returns True if supported
   */
  static isProviderSupported(provider: string): boolean {
    return Object.values(ElevationProvider).includes(provider as ElevationProvider);
  }
}

/**
 * =============================================================================
 * USAGE EXAMPLES
 * =============================================================================
 * 
 * // 1. Default usage (OpenTopoData)
 * const service = ElevationServiceFactory.create();
 * const elevation = await service.getElevation(-38.2353, -68.6271);
 * 
 * // 2. Configure via environment variable
 * process.env.ELEVATION_PROVIDER = 'opentopo';
 * const service = ElevationServiceFactory.create();
 * 
 * // 3. For testing (mock service)
 * process.env.ELEVATION_PROVIDER = 'mock';
 * const service = ElevationServiceFactory.create();
 * 
 * // 4. Check supported providers
 * const providers = ElevationServiceFactory.getSupportedProviders();
 * console.log('Supported providers:', providers);
 * // ['opentopo', 'google', 'mock']
 * 
 * // 5. Validate provider
 * const isValid = ElevationServiceFactory.isProviderSupported('opentopo');
 * console.log('Is valid:', isValid);  // true
 * 
 * // 6. In Use Case (Dependency Injection)
 * class ProcessKMZUseCase {
 *   private readonly elevationService: IElevationService;
 * 
 *   constructor() {
 *     // Factory creates the service based on config
 *     this.elevationService = ElevationServiceFactory.create();
 *   }
 * 
 *   async execute(kmzFile: Buffer): Promise<TraceData> {
 *     // Use the service without knowing which implementation
 *     const elevations = await this.elevationService.getElevations(coords);
 *     // ...
 *   }
 * }
 * 
 * =============================================================================
 */

/**
 * =============================================================================
 * CONFIGURATION EXAMPLES (.env file)
 * =============================================================================
 * 
 * # Option 1: OpenTopoData (default, recommended for MVP)
 * ELEVATION_PROVIDER=opentopo
 * # No additional config needed
 * 
 * # Option 2: Google Elevation API (future, requires API key)
 * ELEVATION_PROVIDER=google
 * GOOGLE_ELEVATION_API_KEY=your_api_key_here
 * 
 * # Option 3: Mock service (for testing)
 * ELEVATION_PROVIDER=mock
 * # No additional config needed
 * 
 * =============================================================================
 */

/**
 * =============================================================================
 * ADDING NEW PROVIDERS
 * =============================================================================
 * 
 * To add a new elevation provider:
 * 
 * 1. Create the service class implementing IElevationService:
 *    - src/infrastructure/services/elevation/YourService.ts
 * 
 * 2. Add to ElevationProvider enum:
 *    enum ElevationProvider {
 *      // ...
 *      YOUR_PROVIDER = 'your_provider'
 *    }
 * 
 * 3. Add case to factory:
 *    switch (provider) {
 *      // ...
 *      case ElevationProvider.YOUR_PROVIDER:
 *        return this.createYourService();
 *    }
 * 
 * 4. Implement creation method:
 *    private static createYourService(): IElevationService {
 *      return new YourService();
 *    }
 * 
 * 5. Update environment variable documentation
 * 
 * That's it! No changes needed in application code.
 * 
 * =============================================================================
 */