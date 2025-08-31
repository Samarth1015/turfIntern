import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create courts
  const court1 = await prisma.court.upsert({
    where: { id: 'court-1' },
    update: {},
    create: {
      id: 'court-1',
      name: 'Football Court 1',
      description: 'Professional football turf with artificial grass',
      isActive: true
    }
  });

  const court2 = await prisma.court.upsert({
    where: { id: 'court-2' },
    update: {},
    create: {
      id: 'court-2',
      name: 'Football Court 2',
      description: 'Professional football turf with artificial grass',
      isActive: true
    }
  });

  const court3 = await prisma.court.upsert({
    where: { id: 'court-3' },
    update: {},
    create: {
      id: 'court-3',
      name: 'Cricket Ground',
      description: 'Full-size cricket ground with proper pitch',
      isActive: true
    }
  });

  console.log('✅ Courts created:', { court1, court2, court3 });

  // Create time slots for each court (Monday to Sunday)
  const timeSlots: any[] = [];
  
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    // Morning slots: 6:00 AM to 12:00 PM
    for (let hour = 6; hour < 12; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      // Create slots for all courts
      for (const court of [court1, court2, court3]) {
        const timeSlot = await prisma.timeSlot.upsert({
          where: {
            courtId_startTime_endTime_dayOfWeek: {
              courtId: court.id,
              startTime,
              endTime,
              dayOfWeek
            }
          },
          update: {},
          create: {
            courtId: court.id,
            startTime,
            endTime,
            dayOfWeek,
            isActive: true
          }
        });
        timeSlots.push(timeSlot);
      }
    }
    
    // Evening slots: 4:00 PM to 10:00 PM
    for (let hour = 16; hour < 22; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      // Create slots for all courts
      for (const court of [court1, court2, court3]) {
        const timeSlot = await prisma.timeSlot.upsert({
          where: {
            courtId_startTime_endTime_dayOfWeek: {
              courtId: court.id,
              startTime,
              endTime,
              dayOfWeek
            }
          },
          update: {},
          create: {
            courtId: court.id,
            startTime,
            endTime,
            dayOfWeek,
            isActive: true
          }
        });
        timeSlots.push(timeSlot);
      }
    }
  }

  console.log(`✅ Created ${timeSlots.length} time slots`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
