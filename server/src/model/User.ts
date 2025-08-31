import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export interface CreateUserData {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
}

export class User {
  static async create(data: CreateUserData) {
    try {
      return await prisma.user.create({
        data
      });
    } catch (error) {
      throw new Error(`Failed to create user: ${error}`);
    }
  }

  static async findByClerkId(clerkId: string) {
    try {
      return await prisma.user.findUnique({
        where: { clerkId }
      });
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error}`);
    }
  }

  static async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email }
      });
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error}`);
    }
  }

  static async upsertByClerkId(clerkId: string, data: CreateUserData) {
    try {
      return await prisma.user.upsert({
        where: { clerkId },
        update: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName
        },
        create: data
      });
    } catch (error) {
      throw new Error(`Failed to upsert user: ${error}`);
    }
  }

  static async update(clerkId: string, data: UpdateUserData) {
    try {
      return await prisma.user.update({
        where: { clerkId },
        data
      });
    } catch (error) {
      throw new Error(`Failed to update user: ${error}`);
    }
  }

  static async delete(clerkId: string) {
    try {
      return await prisma.user.delete({
        where: { clerkId }
      });
    } catch (error) {
      throw new Error(`Failed to delete user: ${error}`);
    }
  }
}
