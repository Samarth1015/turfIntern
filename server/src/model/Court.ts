import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export interface CreateCourtData {
  name: string;
  description?: string;
}

export interface UpdateCourtData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class Court {
  static async create(data: CreateCourtData) {
    try {
      return await prisma.court.create({
        data
      });
    } catch (error) {
      throw new Error(`Failed to create court: ${error}`);
    }
  }

  static async findAll() {
    try {
      return await prisma.court.findMany({
        where: { isActive: true },
        include: {
          timeSlots: {
            where: { isActive: true }
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch courts: ${error}`);
    }
  }

  static async findById(id: string) {
    try {
      return await prisma.court.findUnique({
        where: { id },
        include: {
          timeSlots: {
            where: { isActive: true }
          },
          bookings: {
            include: {
              timeSlot: true
            }
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch court: ${error}`);
    }
  }

  static async update(id: string, data: UpdateCourtData) {
    try {
      return await prisma.court.update({
        where: { id },
        data
      });
    } catch (error) {
      throw new Error(`Failed to update court: ${error}`);
    }
  }

  static async delete(id: string) {
    try {
      return await prisma.court.update({
        where: { id },
        data: { isActive: false }
      });
    } catch (error) {
      throw new Error(`Failed to delete court: ${error}`);
    }
  }
}
