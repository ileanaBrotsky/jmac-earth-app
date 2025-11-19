declare module 'supertest' {
  import { Request, Response, NextFunction } from 'express';
  
  function request(
    app: any
  ): any;

  export = request;
}
