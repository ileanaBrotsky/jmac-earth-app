/**
 * =============================================================================
 * HYDRAULIC PARAMETERS VALUE OBJECT
 * =============================================================================
 * 
 * Encapsulates all hydraulic parameters needed for pump/valve calculations.
 * 
 * Value Object characteristics:
 * - Immutable: Once created, cannot be changed
 * - Self-validating: Validates all parameters on creation
 * - No identity: Compared by value
 * - Domain logic: Encapsulates hydraulic calculation rules
 * 
 * Why a Value Object?
 * - Parameters are a cohesive domain concept
 * - Have complex validation rules
 * - Require unit conversions (m³/h ↔ BPM)
 * - Should be immutable (changing params = new calculation)
 * 
 * @module domain/value-objects
 * =============================================================================
 */

/**
 * Supported flexi (hose) diameters
 * Currently supporting 10" and 12" (as per Excel)
 * 
 * TODO: Add 8", 14", 16" when coefficient tables are available
 */
export enum FlexiDiameter {
  TEN_INCH = '10',
  TWELVE_INCH = '12'
}

/**
 * Properties for creating HydraulicParameters
 */
export interface HydraulicParametersProps {
  flowRate_m3h: number;          // Flow rate in m³/hour
  flexiDiameter: FlexiDiameter;  // Hose diameter (10" or 12")
  pumpingPressure_kgcm2: number; // Pumping pressure in kg/cm²
  numberOfLines: number;          // Number of parallel hose lines
  calculationInterval_m: number;  // Calculation interval in meters
}

/**
 * HydraulicParameters Value Object
 * 
 * Encapsulates all parameters needed for hydraulic calculations.
 * Performs validation and unit conversions.
 */
export class HydraulicParameters {
  private readonly _flowRate_m3h: number;
  private readonly _flexiDiameter: FlexiDiameter;
  private readonly _pumpingPressure_kgcm2: number;
  private readonly _numberOfLines: number;
  private readonly _calculationInterval_m: number;

  /**
   * Validation ranges
   */
  private static readonly FLOW_RATE_MIN = 1;      // m³/h
  private static readonly FLOW_RATE_MAX = 1000;   // m³/h
  private static readonly PRESSURE_MIN = 1;       // kg/cm²
  private static readonly PRESSURE_MAX = 20;      // kg/cm²
  private static readonly LINES_MIN = 1;
  private static readonly LINES_MAX = 10;
  private static readonly INTERVAL_MIN = 10;      // meters
  private static readonly INTERVAL_MAX = 500;     // meters

  /**
   * Conversion constants
   */
  private static readonly M3H_TO_BPM = 0.1048;    // 1 m³/h = 0.1048 BPM
  private static readonly KGCM2_TO_PSI = 14.2233; // 1 kg/cm² = 14.2233 PSI

  /**
   * Private constructor to enforce validation
   * Use static factory method to create instances
   */
  private constructor(props: HydraulicParametersProps) {
    this.validateFlowRate(props.flowRate_m3h);
    this.validateFlexiDiameter(props.flexiDiameter);
    this.validatePumpingPressure(props.pumpingPressure_kgcm2);
    this.validateNumberOfLines(props.numberOfLines);
    this.validateCalculationInterval(props.calculationInterval_m);

    this._flowRate_m3h = props.flowRate_m3h;
    this._flexiDiameter = props.flexiDiameter;
    this._pumpingPressure_kgcm2 = props.pumpingPressure_kgcm2;
    this._numberOfLines = props.numberOfLines;
    this._calculationInterval_m = props.calculationInterval_m;
  }

  // ===========================================================================
  // FACTORY METHOD
  // ===========================================================================

  /**
   * Create HydraulicParameters
   * 
   * @param props - Parameters object
   * @returns New HydraulicParameters instance
   * @throws Error if any parameter is invalid
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
   * console.log(params.flowRate_bpm);  // 12.576 BPM
   * console.log(params.flowRatePerLine_bpm);  // 12.576 BPM (1 line)
   * ```
   */
  static create(props: HydraulicParametersProps): HydraulicParameters {
    return new HydraulicParameters(props);
  }

  // ===========================================================================
  // GETTERS - Flow Rate
  // ===========================================================================

  /**
   * Get total flow rate in m³/hour
   */
  get flowRate_m3h(): number {
    return this._flowRate_m3h;
  }

  /**
   * Get total flow rate in BPM (Barrels Per Minute)
   * 
   * Uses conversion: 1 m³/h = 0.1048 BPM
   */
  get flowRate_bpm(): number {
    return this._flowRate_m3h * HydraulicParameters.M3H_TO_BPM;
  }

  /**
   * Get flow rate per line in m³/hour
   * 
   * When multiple lines, total flow is divided equally
   */
  get flowRatePerLine_m3h(): number {
    return this._flowRate_m3h / this._numberOfLines;
  }

  /**
   * Get flow rate per line in BPM
   * 
   * This is the value used to lookup friction coefficient in tables
   */
  get flowRatePerLine_bpm(): number {
    return this.flowRatePerLine_m3h * HydraulicParameters.M3H_TO_BPM;
  }

  // ===========================================================================
  // GETTERS - Flexi Diameter
  // ===========================================================================

  /**
   * Get flexi diameter
   */
  get flexiDiameter(): FlexiDiameter {
    return this._flexiDiameter;
  }

  /**
   * Get flexi diameter as number (for calculations)
   */
  get flexiDiameterInches(): number {
    return parseInt(this._flexiDiameter, 10);
  }

  // ===========================================================================
  // GETTERS - Pumping Pressure
  // ===========================================================================

  /**
   * Get pumping pressure in kg/cm²
   */
  get pumpingPressure_kgcm2(): number {
    return this._pumpingPressure_kgcm2;
  }

  /**
   * Get pumping pressure in PSI
   * 
   * Uses conversion: 1 kg/cm² = 14.2233 PSI
   */
  get pumpingPressure_psi(): number {
    return this._pumpingPressure_kgcm2 * HydraulicParameters.KGCM2_TO_PSI;
  }

  // ===========================================================================
  // GETTERS - Number of Lines
  // ===========================================================================

  /**
   * Get number of parallel hose lines
   */
  get numberOfLines(): number {
    return this._numberOfLines;
  }

  /**
   * Check if using multiple lines
   */
  get hasMultipleLines(): boolean {
    return this._numberOfLines > 1;
  }

  // ===========================================================================
  // GETTERS - Calculation Interval
  // ===========================================================================

  /**
   * Get calculation interval in meters
   */
  get calculationInterval_m(): number {
    return this._calculationInterval_m;
  }

  // ===========================================================================
  // DOMAIN BEHAVIOR
  // ===========================================================================

  /**
   * Check if parameters are equal to another
   * 
   * @param other - Other parameters to compare
   * @returns True if all parameters match
   */
  equals(other: HydraulicParameters): boolean {
    return (
      Math.abs(this._flowRate_m3h - other._flowRate_m3h) < 0.01 &&
      this._flexiDiameter === other._flexiDiameter &&
      Math.abs(this._pumpingPressure_kgcm2 - other._pumpingPressure_kgcm2) < 0.01 &&
      this._numberOfLines === other._numberOfLines &&
      Math.abs(this._calculationInterval_m - other._calculationInterval_m) < 0.1
    );
  }

  /**
   * Create a copy with modified flow rate
   * 
   * @param flowRate_m3h - New flow rate
   * @returns New HydraulicParameters instance
   */
  withFlowRate(flowRate_m3h: number): HydraulicParameters {
    return HydraulicParameters.create({
      flowRate_m3h,
      flexiDiameter: this._flexiDiameter,
      pumpingPressure_kgcm2: this._pumpingPressure_kgcm2,
      numberOfLines: this._numberOfLines,
      calculationInterval_m: this._calculationInterval_m
    });
  }

  /**
   * Create a copy with modified number of lines
   * 
   * @param numberOfLines - New number of lines
   * @returns New HydraulicParameters instance
   */
  withNumberOfLines(numberOfLines: number): HydraulicParameters {
    return HydraulicParameters.create({
      flowRate_m3h: this._flowRate_m3h,
      flexiDiameter: this._flexiDiameter,
      pumpingPressure_kgcm2: this._pumpingPressure_kgcm2,
      numberOfLines,
      calculationInterval_m: this._calculationInterval_m
    });
  }

  /**
   * Create a copy with modified calculation interval
   * 
   * @param calculationInterval_m - New interval in meters
   * @returns New HydraulicParameters instance
   */
  withInterval(calculationInterval_m: number): HydraulicParameters {
    return HydraulicParameters.create({
      flowRate_m3h: this._flowRate_m3h,
      flexiDiameter: this._flexiDiameter,
      pumpingPressure_kgcm2: this._pumpingPressure_kgcm2,
      numberOfLines: this._numberOfLines,
      calculationInterval_m
    });
  }

  // ===========================================================================
  // SERIALIZATION
  // ===========================================================================

  /**
   * Convert to plain object (for JSON serialization)
   * 
   * @returns Plain object with all parameters
   */
  toObject(): HydraulicParametersProps {
    return {
      flowRate_m3h: this._flowRate_m3h,
      flexiDiameter: this._flexiDiameter,
      pumpingPressure_kgcm2: this._pumpingPressure_kgcm2,
      numberOfLines: this._numberOfLines,
      calculationInterval_m: this._calculationInterval_m
    };
  }

  /**
   * JSON serialization (automatically called by JSON.stringify)
   */
  toJSON(): HydraulicParametersProps {
    return this.toObject();
  }

  /**
   * Get summary object with conversions (for display)
   * 
   * @returns Object with all values and conversions
   */
  toSummary(): {
    flowRate: {
      total_m3h: number;
      total_bpm: number;
      perLine_m3h: number;
      perLine_bpm: number;
    };
    flexi: {
      diameter: FlexiDiameter;
      diameterInches: number;
    };
    pumpingPressure: {
      kgcm2: number;
      psi: number;
    };
    numberOfLines: number;
    calculationInterval_m: number;
  } {
    return {
      flowRate: {
        total_m3h: this.flowRate_m3h,
        total_bpm: this.flowRate_bpm,
        perLine_m3h: this.flowRatePerLine_m3h,
        perLine_bpm: this.flowRatePerLine_bpm
      },
      flexi: {
        diameter: this.flexiDiameter,
        diameterInches: this.flexiDiameterInches
      },
      pumpingPressure: {
        kgcm2: this.pumpingPressure_kgcm2,
        psi: this.pumpingPressure_psi
      },
      numberOfLines: this.numberOfLines,
      calculationInterval_m: this.calculationInterval_m
    };
  }

  /**
   * String representation for debugging
   */
  toString(): string {
    return `HydraulicParameters(` +
      `flowRate: ${this.flowRate_m3h}m³/h (${this.flowRate_bpm.toFixed(2)}BPM), ` +
      `flexi: ${this.flexiDiameter}", ` +
      `pressure: ${this.pumpingPressure_kgcm2}kg/cm² (${this.pumpingPressure_psi.toFixed(2)}PSI), ` +
      `lines: ${this.numberOfLines}, ` +
      `interval: ${this.calculationInterval_m}m` +
      `)`;
  }

  // ===========================================================================
  // VALIDATION (Private)
  // ===========================================================================

  /**
   * Validate flow rate
   */
  private validateFlowRate(flowRate_m3h: number): void {
    if (typeof flowRate_m3h !== 'number' || isNaN(flowRate_m3h)) {
      throw new Error(`Flow rate must be a number, got: ${flowRate_m3h}`);
    }

    if (flowRate_m3h < HydraulicParameters.FLOW_RATE_MIN) {
      throw new Error(
        `Flow rate too low: ${flowRate_m3h}m³/h. Minimum: ${HydraulicParameters.FLOW_RATE_MIN}m³/h`
      );
    }

    if (flowRate_m3h > HydraulicParameters.FLOW_RATE_MAX) {
      throw new Error(
        `Flow rate too high: ${flowRate_m3h}m³/h. Maximum: ${HydraulicParameters.FLOW_RATE_MAX}m³/h`
      );
    }
  }

  /**
   * Validate flexi diameter
   */
  private validateFlexiDiameter(diameter: FlexiDiameter): void {
    const validDiameters = Object.values(FlexiDiameter);
    
    if (!validDiameters.includes(diameter)) {
      throw new Error(
        `Invalid flexi diameter: "${diameter}". Valid options: ${validDiameters.join(', ')}`
      );
    }
  }

  /**
   * Validate pumping pressure
   */
  private validatePumpingPressure(pressure_kgcm2: number): void {
    if (typeof pressure_kgcm2 !== 'number' || isNaN(pressure_kgcm2)) {
      throw new Error(`Pumping pressure must be a number, got: ${pressure_kgcm2}`);
    }

    if (pressure_kgcm2 < HydraulicParameters.PRESSURE_MIN) {
      throw new Error(
        `Pumping pressure too low: ${pressure_kgcm2}kg/cm². Minimum: ${HydraulicParameters.PRESSURE_MIN}kg/cm²`
      );
    }

    if (pressure_kgcm2 > HydraulicParameters.PRESSURE_MAX) {
      throw new Error(
        `Pumping pressure too high: ${pressure_kgcm2}kg/cm². Maximum: ${HydraulicParameters.PRESSURE_MAX}kg/cm²`
      );
    }
  }

  /**
   * Validate number of lines
   */
  private validateNumberOfLines(lines: number): void {
    if (typeof lines !== 'number' || isNaN(lines)) {
      throw new Error(`Number of lines must be a number, got: ${lines}`);
    }

    if (!Number.isInteger(lines)) {
      throw new Error(`Number of lines must be an integer, got: ${lines}`);
    }

    if (lines < HydraulicParameters.LINES_MIN) {
      throw new Error(
        `Number of lines too low: ${lines}. Minimum: ${HydraulicParameters.LINES_MIN}`
      );
    }

    if (lines > HydraulicParameters.LINES_MAX) {
      throw new Error(
        `Number of lines too high: ${lines}. Maximum: ${HydraulicParameters.LINES_MAX}`
      );
    }
  }

  /**
   * Validate calculation interval
   */
  private validateCalculationInterval(interval_m: number): void {
    if (typeof interval_m !== 'number' || isNaN(interval_m)) {
      throw new Error(`Calculation interval must be a number, got: ${interval_m}`);
    }

    if (interval_m < HydraulicParameters.INTERVAL_MIN) {
      throw new Error(
        `Calculation interval too small: ${interval_m}m. Minimum: ${HydraulicParameters.INTERVAL_MIN}m`
      );
    }

    if (interval_m > HydraulicParameters.INTERVAL_MAX) {
      throw new Error(
        `Calculation interval too large: ${interval_m}m. Maximum: ${HydraulicParameters.INTERVAL_MAX}m`
      );
    }
  }
}

/**
 * =============================================================================
 * USAGE EXAMPLES
 * =============================================================================
 * 
 * // Creating parameters
 * const params = HydraulicParameters.create({
 *   flowRate_m3h: 120,
 *   flexiDiameter: FlexiDiameter.TWELVE_INCH,
 *   pumpingPressure_kgcm2: 8,
 *   numberOfLines: 2,
 *   calculationInterval_m: 50
 * });
 * 
 * // Accessing values
 * console.log(params.flowRate_m3h);         // 120
 * console.log(params.flowRate_bpm);         // 12.576
 * console.log(params.flowRatePerLine_bpm);  // 6.288 (divided by 2 lines)
 * console.log(params.pumpingPressure_psi);  // 113.78
 * 
 * // Getting summary
 * const summary = params.toSummary();
 * console.log(summary);
 * 
 * // Creating modified copy
 * const moreLines = params.withNumberOfLines(3);
 * console.log(moreLines.flowRatePerLine_bpm);  // 4.192 (divided by 3)
 * 
 * // Validation (throws error)
 * try {
 *   const invalid = HydraulicParameters.create({
 *     flowRate_m3h: -10,  // ❌ Negative flow rate
 *     flexiDiameter: FlexiDiameter.TWELVE_INCH,
 *     pumpingPressure_kgcm2: 8,
 *     numberOfLines: 1,
 *     calculationInterval_m: 50
 *   });
 * } catch (error) {
 *   console.error(error.message);
 * }
 * 
 * =============================================================================
 */