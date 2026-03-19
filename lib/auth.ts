import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: { email: { type: 'email' }, password: { type: 'password' } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { property: true },
        });
        if (!user || !user.isActive) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        return {
          id: user.id, email: user.email, name: user.fullName,
          role: user.role, department: user.department,
          propertyId: user.propertyId, propertyName: user.property.name,
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.department = (user as any).department;
        token.propertyId = (user as any).propertyId;
        token.propertyName = (user as any).propertyName;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).department = token.department;
        (session.user as any).propertyId = token.propertyId;
        (session.user as any).propertyName = token.propertyName;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
    },
  },
};
