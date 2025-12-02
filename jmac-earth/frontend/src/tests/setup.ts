import '@testing-library/jest-dom';

// Polyfill crypto for testing environment
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  (globalThis as any).crypto = {
    getRandomValues: (arr: Uint8Array) => {
      // Simple polyfill for testing
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  };
}
