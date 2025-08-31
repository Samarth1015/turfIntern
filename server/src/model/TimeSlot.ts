import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export interface CreateTimeSlotData {
  courtId: string;
  startTime: string;
  endTime: string;
  dayOfWeek: number;
}

export interface UpdateTimeSlotData {
  startTime?: string;
  endTime?: string;
  dayOfWeek?: number;
  isActive?: boolean;
}

export class TimeSlot {
  static async create(data: CreateTimeSlotData) {
    try {
      return await prisma.timeSlot.create({
        data
      });
    } catch (error) {
      throw new Error(`Failed to create time slot: ${error}`);
    }
  }

  static async findByCourtId(courtId: string) {
    try {
      return await prisma.timeSlot.findMany({
        where: { 
          courtId,
          isActive: true 
        },
        include: {
          court: true,
          bookings: {
            where: {
              status: {
                in: ['PENDING', 'CONFIRMED']
              }
            }
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch time slots: ${error}`);
    }
  }

  static async findAvailableSlots(courtId: string, date: Date) {
    try {
      const dayOfWeek = date.getDay();
      
      return await prisma.timeSlot.findMany({
        where: {
          courtId,
          dayOfWeek,
          isActive: true
        },
        include: {
          court: true,
          bookings: {
            where: {
              bookingDate: date,
              status: {
                in: ['PENDING', 'CONFIRMED']
              }
            }
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch available slots: ${error}`);
    }
  }

  static async findById(id: string) {
    try {
      return await prisma.timeSlot.findUnique({
        where: { id },
        include: {
          court: true,
          bookings: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch time slot: ${error}`);
    }
  }

  static async update(id: string, data: UpdateTimeSlotData) {
    try {
      return await prisma.timeSlot.update({
        where: { id },
        data
      });
    } catch (error) {
      throw new Error(`Failed to update time slot: ${error}`);
    }
  }

  static async delete(id: string) {
    try {
      return await prisma.timeSlot.update({
        where: { id },
        data: { isActive: false }
      });
    } catch (error) {
      throw new Error(`Failed to delete time slot: ${error}`);
    }
  }
}
