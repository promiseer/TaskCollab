import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  debug: true, // Add debug mode
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    error: '/login', // Error code passed in query string as ?error=
  },
  callbacks: {
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub!,
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        console.log('🔥 AUTHORIZE FUNCTION CALLED!');
        console.log('Authorize function called with credentials:', { 
          email: credentials?.email, 
          passwordLength: credentials?.password?.length 
        });
        console.log('Request object:', req ? 'Present' : 'Not present');
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing email or password');
          return null;
        }

        try {
          // Find user in local database
          const user = await db.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          console.log('Database query result:', user ? 'User found' : 'User not found');

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          // Check if user has a stored password hash (in the role field)
          if (!user.role) {
            console.log("No password hash found for user:", credentials.email);
            return null;
          }

          // Verify password using bcrypt
          const bcrypt = await import('bcryptjs');
          const isValidPassword = await bcrypt.compare(credentials.password, user.role);
          
          console.log('Password validation result:', isValidPassword);
          
          if (isValidPassword) {
            console.log('Password match! Returning user:', { id: user.id, email: user.email, name: user.name });
            return {
              id: user.id,
              email: user.email,
              name: user.name,
            };
          }

          console.log("Invalid password for user:", credentials.email);
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
