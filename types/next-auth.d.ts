// types/next-auth.d.ts
import { Role, Department } from '@prisma/client';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      department: Department;
      propertyId: string;
      propertyName: string;
    } & DefaultSession['user'];
  }
  interface User {
    role: Role;
    department: Department;
    propertyId: string;
    propertyName: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
    department: Department;
    propertyId: string;
    propertyName: string;
  }
}
