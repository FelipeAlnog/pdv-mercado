// src/lib/auth.ts
import { betterAuth, custom } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { nextCookies } from "better-auth/next-js";


export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  advanced: {
    database:{
      generateId: false
    }
  },
  plugins: [nextCookies(),],


  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },

  // Google OAuth — ative adicionando GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env
  // Crie as credenciais em: https://console.cloud.google.com/apis/credentials
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),

  session: {

    expiresIn: 60 * 60 * 24, // 1 dia
     cookie: {
      secure: true,      // HTTPS only
      httpOnly: true,    // JS não acessa
      sameSite: "lax",   // protege CSRF
    },
  },
   

});