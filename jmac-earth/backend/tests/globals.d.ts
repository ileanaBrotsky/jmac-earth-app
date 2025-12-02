/// <reference types="jest" />

// Esto asegura que TypeScript reconozca los globals de Jest
declare global {
  const describe: typeof import('@jest/globals')['describe'];
  const test: typeof import('@jest/globals')['test'];
  const expect: typeof import('@jest/globals')['expect'];
  const beforeEach: typeof import('@jest/globals')['beforeEach'];
  const afterEach: typeof import('@jest/globals')['afterEach'];
  const beforeAll: typeof import('@jest/globals')['beforeAll'];
  const afterAll: typeof import('@jest/globals')['afterAll'];
  const jest: typeof import('@jest/globals')['jest'];
}

export {};