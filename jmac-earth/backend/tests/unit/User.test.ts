/**
 * Tests Unitarios - User Entity
 * 
 * Estos tests validan la lógica de negocio de la entidad User.
 * Son tests PUROS, sin dependencias de DB o servicios externos.
 */

import { User, UserProps, CreateUserProps } from '../../../../src/domain/entities/User';
import { Email } from '../../../../src/domain/value-objects/Email';
import { Role, RoleType } from '../../../../src/domain/value-objects/Role';

describe('User Entity', () => {
  
  /**
   * Datos de prueba válidos
   */
  const validUserProps: UserProps = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    email: new Email('test@example.com'),
    password: '$2b$10$hashedpassword',
    role: new Role(RoleType.OPERATOR),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  };

  describe('Constructor', () => {
    
    it('debe crear un usuario con propiedades válidas usando Value Objects', () => {
      const user = new User(validUserProps);
      
      expect(user.id).toBe(validUserProps.id);
      expect(user.username).toBe(validUserProps.username);
      expect(user.password).toBe(validUserProps.password);
      expect(user.createdAt).toEqual(validUserProps.createdAt);
      expect(user.updatedAt).toEqual(validUserProps.updatedAt);
      
      expect(user.email).toBeInstanceOf(Email);
      expect(user.email.getValue()).toBe('test@example.com');
      
      expect(user.role).toBeInstanceOf(Role);
      expect(user.role.getValue()).toBe(RoleType.OPERATOR);
    });

    it('debe validar email usando el Email Value Object', () => {
      expect(() => new Email('invalid-email')).toThrow('Formato de email inválido');
      expect(() => new Email('')).toThrow('Email no puede estar vacío');
      expect(() => new Email('a@b')).toThrow('Email debe tener al menos 5 caracteres');
    });

    it('debe validar role usando el Role Value Object', () => {
      expect(() => new Role('invalid-role')).toThrow(/Rol inválido/);
      expect(() => new Role('')).toThrow('Rol no puede estar vacío');
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

    it('debe lanzar error si password está vacío', () => {
      const invalidProps = { ...validUserProps, password: '' };
      expect(() => new User(invalidProps)).toThrow('Password no puede estar vacío');
    });
  });

  describe('Getters', () => {
    
    it('email getter debe retornar Email Value Object', () => {
      const user = new User(validUserProps);
      const email = user.email;
      
      expect(email).toBeInstanceOf(Email);
      expect(email.getValue()).toBe('test@example.com');
      expect(email.getDomain()).toBe('example.com');
      expect(email.getUsername()).toBe('test');
    });

    it('role getter debe retornar Role Value Object', () => {
      const user = new User(validUserProps);
      const role = user.role;
      
      expect(role).toBeInstanceOf(Role);
      expect(role.getValue()).toBe(RoleType.OPERATOR);
      expect(role.isOperator()).toBe(true);
      expect(role.canManageProjects()).toBe(false);
    });
  });

  describe('Role Checks', () => {
    
    it('isAdmin() debe retornar true para usuario admin', () => {
      const adminUser = new User({ 
        ...validUserProps, 
        role: new Role(RoleType.ADMIN)
      });
      
      expect(adminUser.isAdmin()).toBe(true);
      expect(adminUser.role.isAdmin()).toBe(true);
    });

    it('isAdmin() debe retornar false para usuario no admin', () => {
      const operatorUser = new User({ 
        ...validUserProps, 
        role: new Role(RoleType.OPERATOR)
      });
      
      expect(operatorUser.isAdmin()).toBe(false);
      expect(operatorUser.role.isAdmin()).toBe(false);
    });

    it('isCoordinator() debe retornar true para coordinador', () => {
      const coordinatorUser = new User({ 
        ...validUserProps, 
        role: new Role(RoleType.COORDINATOR)
      });
      
      expect(coordinatorUser.isCoordinator()).toBe(true);
      expect(coordinatorUser.role.isCoordinator()).toBe(true);
    });

    it('isOperator() debe retornar true para operario', () => {
      const operatorUser = new User({ 
        ...validUserProps, 
        role: new Role(RoleType.OPERATOR)
      });
      
      expect(operatorUser.isOperator()).toBe(true);
      expect(operatorUser.role.isOperator()).toBe(true);
    });
  });

  describe('Permission Checks', () => {
    
    describe('canManageUsers()', () => {
      it('debe retornar true solo para Admin', () => {
        const adminUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.ADMIN) 
        });
        const coordinatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.COORDINATOR) 
        });
        const operatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.OPERATOR) 
        });

        expect(adminUser.canManageUsers()).toBe(true);
        expect(coordinatorUser.canManageUsers()).toBe(false);
        expect(operatorUser.canManageUsers()).toBe(false);
        
        expect(adminUser.role.canManageUsers()).toBe(true);
      });
    });

    describe('canCreateProjects()', () => {
      it('debe retornar true para Admin y Coordinator', () => {
        const adminUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.ADMIN) 
        });
        const coordinatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.COORDINATOR) 
        });
        const operatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.OPERATOR) 
        });

        expect(adminUser.canCreateProjects()).toBe(true);
        expect(coordinatorUser.canCreateProjects()).toBe(true);
        expect(operatorUser.canCreateProjects()).toBe(false);
        
        expect(adminUser.role.canManageProjects()).toBe(true);
        expect(coordinatorUser.role.canManageProjects()).toBe(true);
      });
    });

    describe('canEditProjects()', () => {
      it('debe retornar true para Admin y Coordinator', () => {
        const adminUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.ADMIN) 
        });
        const coordinatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.COORDINATOR) 
        });
        const operatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.OPERATOR) 
        });

        expect(adminUser.canEditProjects()).toBe(true);
        expect(coordinatorUser.canEditProjects()).toBe(true);
        expect(operatorUser.canEditProjects()).toBe(false);
      });
    });

    describe('canDeleteProjects()', () => {
      it('debe retornar true para Admin y Coordinator', () => {
        const adminUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.ADMIN) 
        });
        const coordinatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.COORDINATOR) 
        });
        const operatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.OPERATOR) 
        });

        expect(adminUser.canDeleteProjects()).toBe(true);
        expect(coordinatorUser.canDeleteProjects()).toBe(true);
        expect(operatorUser.canDeleteProjects()).toBe(false);
      });
    });

    describe('canAssignProjects()', () => {
      it('debe retornar true para Admin y Coordinator', () => {
        const adminUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.ADMIN) 
        });
        const coordinatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.COORDINATOR) 
        });
        const operatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.OPERATOR) 
        });

        expect(adminUser.canAssignProjects()).toBe(true);
        expect(coordinatorUser.canAssignProjects()).toBe(true);
        expect(operatorUser.canAssignProjects()).toBe(false);
        
        expect(adminUser.role.canAssignProjects()).toBe(true);
      });
    });

    describe('canViewAllProjects()', () => {
      it('debe retornar true para Admin y Coordinator', () => {
        const adminUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.ADMIN) 
        });
        const coordinatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.COORDINATOR) 
        });
        const operatorUser = new User({ 
          ...validUserProps, 
          role: new Role(RoleType.OPERATOR) 
        });

        expect(adminUser.canViewAllProjects()).toBe(true);
        expect(coordinatorUser.canViewAllProjects()).toBe(true);
        expect(operatorUser.canViewAllProjects()).toBe(false);
        
        expect(adminUser.role.canViewAllProjects()).toBe(true);
      });
    });
  });

  describe('Update Methods', () => {
    
    it('updateUsername() debe actualizar el username y updatedAt', () => {
      const user = new User(validUserProps);
      const originalUpdatedAt = user.updatedAt;
      
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);
      user.updateUsername('newusername');
      jest.useRealTimers();
      
      expect(user.username).toBe('newusername');
      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('updateUsername() debe lanzar error si nuevo username es inválido', () => {
      const user = new User(validUserProps);
      
      expect(() => user.updateUsername('')).toThrow('Username no puede estar vacío');
    });

    it('updateEmail() debe aceptar Email Value Object y actualizar', () => {
      const user = new User(validUserProps);
      const newEmail = new Email('newemail@example.com');
      
      user.updateEmail(newEmail);
      
      expect(user.email).toBeInstanceOf(Email);
      expect(user.email.getValue()).toBe('newemail@example.com');
      expect(user.email).toBe(newEmail);
    });

    it('updateEmail() debe fallar si se intenta pasar string inválido', () => {
      expect(() => new Email('invalid-email')).toThrow('Formato de email inválido');
    });

    it('updatePassword() debe actualizar el password y updatedAt', () => {
      const user = new User(validUserProps);
      
      user.updatePassword('$2b$10$newhashedpassword');
      
      expect(user.password).toBe('$2b$10$newhashedpassword');
    });

    it('updateRole() debe aceptar Role Value Object y actualizar', () => {
      const user = new User(validUserProps);
      const newRole = new Role(RoleType.ADMIN);
      
      user.updateRole(newRole);
      
      expect(user.role).toBeInstanceOf(Role);
      expect(user.role.getValue()).toBe(RoleType.ADMIN);
      expect(user.role).toBe(newRole);
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
      expect(json).not.toHaveProperty('password');
    });

    it('debe serializar Email VO a string primitivo', () => {
      const user = new User(validUserProps);
      const json = user.toJSON();
      
      expect(typeof json.email).toBe('string');
      expect(json.email).toBe('test@example.com');
    });

    it('debe serializar Role VO a string primitivo', () => {
      const user = new User(validUserProps);
      const json = user.toJSON();
      
      expect(typeof json.role).toBe('string');
      expect(json.role).toBe('operator');
    });

    it('debe ser compatible con JSON.stringify()', () => {
      const user = new User(validUserProps);
      
      const jsonString = JSON.stringify(user);
      const parsed = JSON.parse(jsonString);
      
      expect(parsed.email).toBe('test@example.com');
      expect(parsed.role).toBe('operator');
      expect(parsed).not.toHaveProperty('password');
    });
  });

  describe('Factory Method - create()', () => {
    
    it('debe crear un nuevo usuario con Value Objects y timestamps automáticos', () => {
      const createProps: CreateUserProps = {
        username: 'newuser',
        email: new Email('new@example.com'),
        password: '$2b$10$hashedpassword',
        role: new Role(RoleType.OPERATOR)
      };
      
      const user = User.create(createProps);
      
      expect(user.username).toBe(createProps.username);
      
      expect(user.email).toBeInstanceOf(Email);
      expect(user.email.getValue()).toBe('new@example.com');
      
      expect(user.password).toBe(createProps.password);
      
      expect(user.role).toBeInstanceOf(Role);
      expect(user.role.getValue()).toBe(RoleType.OPERATOR);
      
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Inmutabilidad de Value Objects', () => {
    
    it('email getter debe retornar siempre el mismo Email VO', () => {
      const user = new User(validUserProps);
      
      const email1 = user.email;
      const email2 = user.email;
      
      expect(email1).toBe(email2);
      expect(email1.getValue()).toBe(email2.getValue());
    });

    it('role getter debe retornar siempre el mismo Role VO', () => {
      const user = new User(validUserProps);
      
      const role1 = user.role;
      const role2 = user.role;
      
      expect(role1).toBe(role2);
      expect(role1.getValue()).toBe(role2.getValue());
    });
  });
});