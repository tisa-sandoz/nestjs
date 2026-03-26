// src/types/express.d.ts

import 'express';
import 'express-session';
import { Role } from 'src/common/enums/role.enum';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      role: Role;
    };
  }
}

declare module 'express' {
  interface Request {
    session: import('express-session').Session &
      Partial<import('express-session').SessionData>;
  }
}

export {};
