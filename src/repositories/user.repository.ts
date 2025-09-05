
// src/repositories/user.repository.ts
import { PrismaClient, Role, User } from "@prisma/client";

const prisma = new PrismaClient();

export class UserRepository {
  async createUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: Role,
    verificationToken: string
  ): Promise<User> {
    return prisma.user.create({
      data: { firstName, lastName, email, password, role, verificationToken },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { verificationToken: token } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateVerification(
    token: string,
    isVerified: boolean,
    verificationToken: string | null
  ): Promise<User> {
    return prisma.user.update({
      where: { verificationToken: token },
      data: { isVerified, verificationToken },
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  async updatePassword(token: string, password: string): Promise<User> {
    return prisma.user.update({
      where: { verificationToken: token },
      data: { password, verificationToken: null },
    });
  }

  async updateVerificationById(userId: string, verificationToken: string | null): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { verificationToken },
    });
  }
}
