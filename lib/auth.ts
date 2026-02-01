import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma"; // Pastikan import prisma ini benar (tanpa kurung kurawal {})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.notelp,   // Pastikan field di schema prisma namanya 'notelp'
          address: user.address,
          bio: user.bio,
          avatar: user.avatar,  // Pastikan field di schema prisma namanya 'avatar' (atau 'image')
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. Saat login pertama kali
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.avatar = (user as any).avatar;
      }

      // 2. 🔥 HANDLING UPDATE SESSION TANPA LOGOUT 🔥
      // Bagian ini akan jalan ketika frontend memanggil await update({...})
      if (trigger === "update" && session) {
        // Update Avatar
        if (session.user.avatar) {
          token.avatar = session.user.avatar;
        }
        // Update Nama
        if (session.user.name) {
          token.name = session.user.name;
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Mengirim data dari token (yang sudah diupdate) ke session frontend
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
  },
});