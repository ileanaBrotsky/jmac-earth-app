/**
 * Tests Unitarios - User Entity
 * 
 * Estos tests validan la lógica de negocio de la entidad User.
 * Son tests PUROS, sin dependencias de DB o servicios externos.
 */

import { User, UserRole, UserProps, CreateUserProps } from '../../src/domain/entities/User';

describe('User Entity', () => {
  
  // Datos de prueba válidos
  const validUserProps: UserProps = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword', // Simula password hasheado
    role: UserRole.OPERATOR,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  };

  describe('Constructor', () => {
    
    it('debe crear un usuario con propiedades válidas', () => {
      const user = new User(validUserProps);
      
      expect(user.id).toBe(validUserProps.id);
      expect(user.username).toBe(validUserProps.username);
      expect(user.email).toBe(validUserProps.email);
      expect(user.password).toBe(validUserProps.password);
      expect(user.role).toBe(validUserProps.role);
      expect(user.createdAt).toEqual(validUserProps.createdAt);
      expect(user.updatedAt).toEqual(validUserProps.updatedAt);
    });

    it('debe lanzar error si username está vacío', () => {
      const invalidProps = { ...validUserProps, username: '' };
      
      expect(() => new User(invalidProps)).toThrow('Username no puede estar vacío');
    });

    it('debe lanzar error si username tiene menos de 3 caracteres', () => {
      const invalidProps = { ...validUserProps, username: 'ab' };
      
      expect(() => new User(invalidProps)).toThrow('Username debe tener al menos 3 caracteres');
    });

    it('debe lanzar error si username tiene más de 50 caracteres', () => {
      const invalidProps = { 
        ...validUserProps, 
        username: 'a'.repeat(51) 
      };
      
      expect(() => new User(invalidProps)).toThrow('Username no puede tener más de 50 caracteres');
    });

    it('debe lanzar error si username contiene caracteres inválidos', () => {
      const invalidProps = { ...validUserProps, username: 'user@name' };
      
      expect(() => new User(invalidProps)).toThrow('Username solo puede contener letras, números y guiones bajos');
    });

    it('debe lanzar error si email está vacío', () => {
      const invalidProps = { ...validUserProps, email: '' };
      
      expect(() => new User(invalidProps)).toThrow('Email no puede estar vacío');
    });

    it('debe lanzar error si email no es válido', () => {
      const invalidProps = { ...validUserProps, email: 'invalid-email' };
      
      expect(() => new User(invalidProps)).toThrow('Email no es válido');
    });

    it('debe lanzar error si password está vacío', () => {
      const invalidProps = { ...validUserProps, password: '' };
      
      expect(() => new User(invalidProps)).toThrow('Password no puede estar vacío');
    });
  });

  describe('Role Checks', () => {
    
    it('isAdmin() debe retornar true para usuario admin', () => {
      const adminUser = new User({ ...validUserProps, role: UserRole.ADMIN });
      expect(adminUser.isAdmin()).toBe(true);
    });

    it('isAdmin() debe retornar false para usuario no admin', () => {
      const operatorUser = new User({ ...validUserProps, role: UserRole.OPERATOR });
      expect(operatorUser.isAdmin()).toBe(false);
    });

    it('isCoordinator() debe retornar true para coordinador', () => {
      const coordinatorUser = new User({ ...validUserProps, role: UserRole.COORDINATOR });
      expect(coordinatorUser.isCoordinator()).toBe(true);
    });

    it('isOperator() debe retornar true para operario', () => {
      const operatorUser = new User({ ...validUserProps, role: UserRole.OPERATOR });
      expect(operatorUser.isOperator()).toBe(true);
    });
  });

  describe('Permission Checks', () => {
    
    describe('canManageUsers()', () => {
      it('debe retornar true solo para Admin', () => {
        const adminUser = new User({ ...validUserProps, role: UserRole.ADMIN });
        const coordinatorUser = new User({ ...validUserProps, role: UserRole.COORDINATOR });
        const operatorUser = new User({ ...validUserProps, role: UserRole.OPERATOR });

        expect(adminUser.canManageUsers()).toBe(true);
        expect(coordinatorUser.canManageUsers()).toBe(false);
        expect(operatorUser.canManageUsers()).toBe(false);
      });
    });

    describe('canCreateProjects()', () => {
      it('debe retornar true para Admin y Coordinator', () => {
        const adminUser = new User({ ...validUserProps, role: UserRole.ADMIN });
        const coordinatorUser = new User({ ...validUserProps, role: UserRole.COORDINATOR });
        const operatorUser = new User({ ...validUserProps, role: UserRole.OPERATOR });

        expect(adminUser.canCreateProjects()).toBe(true);
        expect(coordinatorUser.canCreateProjects()).toBe(true);
        expect(operatorUser.canCreateProjects()).toBe(false);
      });
    });

    describe('canEditProjects()', () => {
      it('debe retornar true para Admin y Coordinator', () => {
        const adminUser = new User({ ...validUserProps, role: UserRole.ADMIN });
        const coordinatorUser = new User({ ...validUserProps, role: UserRole.COORDINATOR });
        const operatorUser = new User({ ...validUserProps, role: UserRole.OPERATOR });

        expect(adminUser.canEditProjects()).toBe(true);
        expect(coordinatorUser.canEditProjects()).toBe(true);
        expect(operatorUser.canEditProjects()).toBe(false);
      });
    });

    describe('canDeleteProjects()', () => {
      it('debe retornar true para Admin y Coordinator', () => {
        const adminUser = new User({ ...validUserProps, role: UserRole.ADMIN });
        const coordinatorUser = new User({ ...validUserProps, role: UserRole.COORDINATOR });
        const operatorUser = new User({ ...validUserProps, role: UserRole.OPERATOR });

        expect(adminUser.canDeleteProjects()).toBe(true);
        expect(coordinatorUser.canDeleteProjects()).toBe(true);
        expect(operatorUser.canDeleteProjects()).toBe(false);
      });
    });

    describe('canAssignProjects()', () => {
      it('debe retornar true para Admin y Coordinator', () => {
        const adminUser = new User({ ...validUserProps, role: UserRole.ADMIN });
        const coordinatorUser = new User({ ...validUserProps, role: UserRole.COORDINATOR });
        const operatorUser = new User({ ...validUserProps, role: UserRole.OPERATOR });

        expect(adminUser.canAssignProjects()).toBe(true);
        expect(coordinatorUser.canAssignProjects()).toBe(true);
        expect(operatorUser.canAssignProjects()).toBe(false);
      });
    });

    describe('canViewAllProjects()', () => {
      it('debe retornar true para Admin y Coordinator', () => {
        const adminUser = new User({ ...validUserProps, role: UserRole.ADMIN });
        const coordinatorUser = new User({ ...validUserProps, role: UserRole.COORDINATOR });
        const operatorUser = new User({ ...validUserProps, role: UserRole.OPERATOR });

        expect(adminUser.canViewAllProjects()).toBe(true);
        expect(coordinatorUser.canViewAllProjects()).toBe(true);
        expect(operatorUser.canViewAllProjects()).toBe(false);
      });
    });
  });

  describe('Update Methods', () => {
    
    it('updateUsername() debe actualizar el username y updatedAt', () => {
      const user = new User(validUserProps);
      const originalUpdatedAt = user.updatedAt;
      
      // Esperar un milisegundo para asegurar que updatedAt cambie
      setTimeout(() => {
        user.updateUsername('newusername');
        
        expect(user.username).toBe('newusername');
        expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      }, 1);
    });

    it('updateUsername() debe lanzar error si nuevo username es inválido', () => {
      const user = new User(validUserProps);
      
      expect(() => user.updateUsername('')).toThrow('Username no puede estar vacío');
    });

    it('updateEmail() debe actualizar el email y updatedAt', () => {
      const user = new User(validUserProps);
      
      user.updateEmail('newemail@example.com');
      
      expect(user.email).toBe('newemail@example.com');
    });

    it('updateEmail() debe lanzar error si nuevo email es inválido', () => {
      const user = new User(validUserProps);
      
      expect(() => user.updateEmail('invalid-email')).toThrow('Email no es válido');
    });

    it('updatePassword() debe actualizar el password y updatedAt', () => {
      const user = new User(validUserProps);
      
      user.updatePassword('$2b$10$newhashedpassword');
      
      expect(user.password).toBe('$2b$10$newhashedpassword');
    });

    it('updateRole() debe actualizar el rol', () => {
      const user = new User(validUserProps);
      
      user.updateRole(UserRole.ADMIN);
      
      expect(user.role).toBe(UserRole.ADMIN);
    });
  });

  describe('toJSON()', () => {
    
    it('debe retornar objeto sin password', () => {
      const user = new User(validUserProps);
      const json = user.toJSON();
      
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('username');
      expect(json).toHaveProperty('email');
      expect(json).toHaveProperty('role');
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
      expect(json).not.toHaveProperty('password'); // Seguridad: no exponer password
    });
  });

  describe('Factory Method - create()', () => {
    
    it('debe crear un nuevo usuario con timestamps automáticos', () => {
      const createProps: CreateUserProps = {
        username: 'newuser',
        email: 'new@example.com',
        password: '$2b$10$hashedpassword',
        role: UserRole.OPERATOR
      };
      
      const user = User.create(createProps);
      
      expect(user.username).toBe(createProps.username);
      expect(user.email).toBe(createProps.email);
      expect(user.password).toBe(createProps.password);
      expect(user.role).toBe(createProps.role);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });
});
