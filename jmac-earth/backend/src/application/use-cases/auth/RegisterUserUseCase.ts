import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { Role } from '@domain/value-objects/Role';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import bcryptjs from 'bcryptjs';

/**
 * RegisterUserUseCase
 * Orquesta el proceso de registro de un nuevo usuario
 * 
 * Responsabilidades:
 * 1. Validar que email no esté duplicado
 * 2. Validar que username no esté duplicado
 * 3. Hashear password
 * 4. Crear entidad User
 * 5. Persistir en repositorio
 * 6. Retornar usuario creado (sin password)
 * 
 * Excepciones:
 * - Error: Email ya existe
 * - Error: Username ya existe
 * - Error: Validación fallida
 * - Error: Error en base de datos
 */
export class RegisterUserUseCase {
  private readonly userRepository: IUserRepository;
  private readonly HASH_ROUNDS = 10;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecuta el caso de uso de registro
   * 
   * @param username - Username del usuario (3-50 caracteres, alphanumeric + _)
   * @param email - Email válido del usuario
   * @param password - Password en texto plano (debe tener complejidad mínima)
   * @returns Usuario creado (sin password)
   * @throws Error si email/username duplicado o validación falla
   */
  async execute(
    username: string,
    email: string,
    password: string
  ): Promise<{ id: string; username: string; email: string; role: string }> {
    // 1. Crear Email VO para validar formato
    let emailVO: Email;
    try {
      emailVO = new Email(email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`RegisterUserUseCase: Email inválido: ${message}`);
    }

    // 2. Validar que email no esté duplicado
    const existingUserByEmail = await this.userRepository.findByEmail(emailVO);
    if (existingUserByEmail) {
      throw new Error('RegisterUserUseCase: Email ya está registrado');
    }

    // 3. Validar que username no esté duplicado
    const existingUserByUsername = await this.userRepository.findByUsername(username);
    if (existingUserByUsername) {
      throw new Error('RegisterUserUseCase: Username ya está en uso');
    }

    // 4. Validar complejidad mínima de password
    this.validatePassword(password);

    // 5. Hashear password
    let hashedPassword: string;
    try {
      hashedPassword = await bcryptjs.hash(password, this.HASH_ROUNDS);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`RegisterUserUseCase: Error hasheando password: ${message}`);
    }

    // 6. Crear Role VO (OPERATOR por defecto para nuevos usuarios)
    let roleVO: Role;
    try {
      roleVO = new Role('OPERATOR');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`RegisterUserUseCase: Error creando rol: ${message}`);
    }

    // 7. Crear entidad User
    let user: User;
    try {
      user = User.create({
        username,
        email: emailVO,
        password: hashedPassword,
        role: roleVO
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`RegisterUserUseCase: Error creando usuario: ${message}`);
    }

    // 8. Persistir usuario en repositorio
    let savedUser: User;
    try {
      savedUser = await this.userRepository.save(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`RegisterUserUseCase: Error guardando usuario en BD: ${message}`);
    }

    // 9. Retornar usuario creado (sin password)
    return {
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email.getValue(),
      role: savedUser.role.getValue()
    };
  }

  /**
   * Valida complejidad mínima de password
   * Requisitos:
   * - Mínimo 8 caracteres
   * - Al menos una mayúscula
   * - Al menos una minúscula
   * - Al menos un número
   * - Al menos un carácter especial
   * 
   * @param password - Password a validar
   * @throws Error si no cumple requisitos
   */
  private validatePassword(password: string): void {
    if (!password || password.length === 0) {
      throw new Error('Password no puede estar vacío');
    }

    if (password.length < 8) {
      throw new Error('Password debe tener mínimo 8 caracteres');
    }

    if (password.length > 128) {
      throw new Error('Password no puede exceder 128 caracteres');
    }

    // Validaciones opcionales (comentar si no son requeridas)
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasNumber = /\d/.test(password);
    // const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    // if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    //   throw new Error(
    //     'Password debe contener mayúsculas, minúsculas, números y caracteres especiales'
    //   );
    // }
  }
}

export default RegisterUserUseCase;
