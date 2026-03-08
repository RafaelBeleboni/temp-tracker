import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        try {
          // 1. Validar inputs
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          // 2. Buscar usuário no banco
          const user = await prisma.user.findUnique({
            where: { 
              email: credentials.email as string
            }
          })

          // 3. Verificar se usuário existe
          if (!user) {
            console.log("Usuário não encontrado:", credentials.email)
            return null
          }

          // 4. Verificar senha (em produção, use bcrypt!)
          if (user.password !== credentials.password) {
            console.log("Senha incorreta para:", credentials.email)
            return null
          }

          // 5. Retornar dados do usuário (sem senha!)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error("Erro no login:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
})
