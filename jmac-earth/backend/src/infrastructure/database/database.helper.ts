/**
 * =============================================================================
 * TYPEORM DATA SOURCE CONFIGURATION
 * =============================================================================
 * Configuración de conexión a PostgreSQL usando TypeORM.
 * 
 * Este archivo define:
 * - Conexión a la base de datos
 * - Entidades (modelos de tablas)
 * - Migraciones
 * - Configuraciones de desarrollo/producción
 * 
 * IMPORTANTE: Este archivo debe exportar SOLO el DataSource para que
 * funcione correctamente con TypeORM CLI.
 * 
 * @module infrastructure/database/data-source
 * =============================================================================
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Obtiene el nombre de la base de datos según el entorno
 */
const getDatabaseName = (): string => {
  if (process.env.NODE_ENV === 'test') {
    return process.env.DB_TEST_NAME || 'jmac_earth_test';
  }
  return process.env.DB_NAME || 'jmac_earth_dev';
};

/**
 * DataSource principal de TypeORM
 * 
 * Este objeto se usa para:
 * - Ejecutar migraciones: npm run migration:run
 * - Crear migraciones: npm run migration:generate
 * - Conectar la aplicación a la DB
 */
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: getDatabaseName(),
  
  // Entidades TypeORM (modelos de tablas)
  entities: [__dirname + '/entities/*.entity.{ts,js}'],
  
  // Migraciones
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  
  // Suscriptores (para eventos de entidades)
  subscribers: [__dirname + '/subscribers/*.{ts,js}'],
  
  // Sincronización automática de schema (solo desarrollo)
  // ⚠️ NUNCA usar en producción
  synchronize: false,
  
  // Logging de queries (útil para debugging)
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn', 'schema'] : ['error'],
  
  // Pool de conexiones
  extra: {
    max: 10, // Máximo de conexiones
    min: 2,  // Mínimo de conexiones
    idleTimeoutMillis: 30000,
  },
});

/**
 * Export por defecto del DataSource
 * 
 * IMPORTANTE: Este es el ÚNICO export que debe tener este archivo
 * para que funcione correctamente con TypeORM CLI.
 */
export default AppDataSource;