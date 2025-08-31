import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export interface CreateBookingData {
  courtId: string;
  timeSlotId: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  bookingDate: Date;
}

export interface UpdateBookingData {
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export class Booking {
  static async create(data: CreateBookingData) {
    try {
      // Check if the slot is already booked for the given date
      const existingBooking = await prisma.booking.findFirst({
        where: {
          timeSlotId: data.timeSlotId,
          bookingDate: data.bookingDate,
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      });

      if (existingBooking) {
        throw new Error('This time slot is already booked for the selected date');
      }

      return await prisma.booking.create({
        data,
        include: {
          court: true,
          timeSlot: true,
          user: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to create booking: ${error}`);
    }
  }

  static async findAll() {
    try {
      return await prisma.booking.findMany({
        include: {
          court: true,
          timeSlot: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch bookings: ${error}`);
    }
  }

  static async findById(id: string) {
    try {
      return await prisma.booking.findUnique({
        where: { id },
        include: {
          court: true,
          timeSlot: true,
          user: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch booking: ${error}`);
    }
  }

  static async findByCourtId(courtId: string) {
    try {
      return await prisma.booking.findMany({
        where: { courtId },
        include: {
          court: true,
          timeSlot: true,
          user: true
        },
        orderBy: {
          bookingDate: 'desc'
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch court bookings: ${error}`);
    }
  }

  static async findByUserId(userId: string) {
    try {
      return await prisma.booking.findMany({
        where: { userId },
        include: {
          court: true,
          timeSlot: true,
          user: true
        },
        orderBy: {
          bookingDate: 'desc'
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch user bookings: ${error}`);
    }
  }

  static async findByDate(date: Date) {
    try {
      return await prisma.booking.findMany({
        where: { bookingDate: date },
        include: {
          court: true,
          timeSlot: true,
          user: true
        },
        orderBy: {
          timeSlot: {
            startTime: 'asc'
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch date bookings: ${error}`);
    }
  }

  static async update(id: string, data: UpdateBookingData) {
    try {
      return await prisma.booking.update({
        where: { id },
        data,
        include: {
          court: true,
          timeSlot: true,
          user: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to update booking: ${error}`);
    }
  }

  static async cancel(id: string) {
    try {
      return await prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          court: true,
          timeSlot: true,
          user: true
        }
      });
    } catch (error) {
      throw new Error(`Failed to cancel booking: ${error}`);
    }
  }

  static async delete(id: string) {
    try {
      return await prisma.booking.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error(`Failed to delete booking: ${error}`);
    }
  }
}
