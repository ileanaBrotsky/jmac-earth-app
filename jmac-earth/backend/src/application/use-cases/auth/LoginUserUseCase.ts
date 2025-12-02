import { Email } from '@domain/value-objects/Email';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import bcryptjs from 'bcryptjs';

/**
 * LoginUserUseCase
 * Orquesta el proceso de autenticación de un usuario
 * 
 * Responsabilidades:
 * 1. Buscar usuario por email
 * 2. Validar password contra hash almacenado
 * 3. Retornar usuario si credenciales son válidas
 * 4. Lanzar error si credenciales son inválidas
 * 
 * Excepciones:
 * - Error: Usuario no encontrado o credenciales inválidas
 * - Error: Email inválido
 */
export class LoginUserUseCase {
  private readonly userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Ejecuta el caso de uso de login
   * 
   * @param email - Email del usuario
   * @param password - Password en texto plano
   * @returns Usuario autenticado (sin password)
   * @throws Error si email/password inválidos
   */
  async execute(
    email: string,
    password: string
  ): Promise<{ id: string; username: string; email: string; role: string }> {
    // 1. Crear Email VO para validar formato
    let emailVO: Email;
    try {
      emailVO = new Email(email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`LoginUserUseCase: Email inválido: ${message}`);
    }

    // 2. Buscar usuario por email
    const user = await this.userRepository.findByEmail(emailVO);
    if (!user) {
      // No revelar si el email existe o no por seguridad
      throw new Error('LoginUserUseCase: Email o password incorrecto');
    }

    // 3. Validar password
    let isPasswordValid: boolean;
    try {
      isPasswordValid = await bcryptjs.compare(password, user.password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`LoginUserUseCase: Error validando password: ${message}`);
    }

    if (!isPasswordValid) {
      // No revelar que el email existe
      throw new Error('LoginUserUseCase: Email o password incorrecto');
    }

    // 4. Retornar usuario (sin password)
    return {
      id: user.id,
      username: user.username,
      email: user.email.getValue(),
      role: user.role.getValue()
    };
  }
}

export default LoginUserUseCase;
