import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old data...');
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  console.log('  // 1. Create Users & Profiles');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@equilibrar.cl',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Pedro',
          lastName: 'Sánchez',
          phone: '+56912345678',
          documentId: '12.345.678-9',
          address: 'Av. Providencia 1234, Of 502',
          city: 'Santiago'
        }
      }
    }
  });

  console.log('Creating Coordinator...');
  const coordinator = await prisma.user.create({
    data: {
      email: 'coord@equilibrar.cl',
      passwordHash: passwordHash, // Changed from defaultPass to passwordHash as defaultPass is not defined
      role: 'COORDINATOR',
      profile: {
        create: {
          firstName: 'Ana',
          lastName: 'Gómez',
          phone: '+56987654321',
          documentId: '15.678.901-K',
          address: 'Guardia Vieja 255',
          city: 'Providencia'
        }
      }
    }
  });

  console.log('Creating Specialists...');
  const spec1 = await prisma.user.create({
    data: {
      email: 'mariapaz@equilibrar.cl',
      passwordHash,
      role: 'SPECIALIST',
      profile: { create: { firstName: 'María Paz', lastName: 'Ríos', specialty: 'Psicología Clínica', bio: 'Especialista en ansiedad y depresión.' } }
    }
  });
  const spec2 = await prisma.user.create({
    data: {
      email: 'fernando@equilibrar.cl',
      passwordHash,
      role: 'SPECIALIST',
      profile: { create: { firstName: 'Fernando', lastName: 'Gómez', specialty: 'Psiquiatría', bio: 'Psiquiatra de adultos.' } }
    }
  });

  console.log('Creating Clients...');
  const client1 = await prisma.user.create({
    data: {
      email: 'camila@cliente.cl',
      passwordHash,
      role: 'CLIENT',
      profile: {
        create: {
          firstName: 'Camila',
          lastName: 'Rojas',
          phone: '+56977778888',
          documentId: '18.777.888-9',
          address: 'Pasaje Los Pinos 401',
          city: 'Ñuñoa'
        }
      }
    }
  });

  const client2 = await prisma.user.create({
    data: {
      email: 'juan@cliente.cl',
      passwordHash: passwordHash,
      role: 'CLIENT',
      profile: {
        create: {
          firstName: 'Juan',
          lastName: 'Pérez',
          phone: '+56911112222',
          documentId: '19.111.222-3',
          address: 'Av. Macul 2341, Depto 12',
          city: 'Macul'
        }
      }
    }
  });

  console.log('Creating Services...');
  const srv1 = await prisma.service.create({
    data: { name: 'Sesión Psicología Individual', duration: 60, price: 35000, description: 'Terapia individual online o presencial.' }
  });
  const srv2 = await prisma.service.create({
    data: { name: 'Consulta Psiquiátrica', duration: 45, price: 50000, description: 'Evaluación y tratamiento farmacológico.' }
  });
  const srv3 = await prisma.service.create({
    data: { name: 'Programa Bienestar (4 Sesiones)', duration: 60, price: 120000, description: 'Paquete de 4 sesiones de psicología.' }
  });

  console.log('Creating Appointments and Payments...');
  
  // Date helpers
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

  // Appt 1: Online, confirmed, paid
  const appt1 = await prisma.appointment.create({
    data: {
      clientId: client1.id,
      specialistId: spec1.id,
      serviceId: srv1.id,
      date: new Date(today.setHours(9, 0, 0, 0)),
      sessionType: 'ONLINE',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      status: 'COMPLETED',
      payment: {
        create: {
          userId: client1.id,
          amount: 35000,
          status: 'COMPLETED',
          paymentMethod: 'MERCADOPAGO',
          transactionId: 'TX12345'
        }
      }
    }
  });

  // Appt 2: In Person, scheduled, pending payment
  const appt2 = await prisma.appointment.create({
    data: {
      clientId: client2.id,
      specialistId: spec2.id,
      serviceId: srv2.id,
      date: new Date(tomorrow.setHours(10, 30, 0, 0)),
      sessionType: 'IN_PERSON',
      notes: 'Consulta presencial Av. Providencia',
      status: 'SCHEDULED',
      payment: {
        create: {
          userId: client2.id,
          amount: 50000,
          status: 'PENDING'
        }
      }
    }
  });

  // Appt 3: Program, scheduled, paid
  const appt3 = await prisma.appointment.create({
    data: {
      clientId: client1.id,
      specialistId: spec1.id,
      serviceId: srv3.id,
      date: new Date(nextWeek.setHours(15, 0, 0, 0)),
      sessionType: 'ONLINE',
      status: 'SCHEDULED',
      payment: {
        create: {
          userId: client1.id,
          amount: 120000,
          status: 'COMPLETED',
          paymentMethod: 'TRANSFER',
          transactionId: 'TRX789'
        }
      }
    }
  });

  // More appointments to fill the calendar!
  for (let i = 1; i <= 5; i++) {
    const randomDay = new Date(today);
    randomDay.setDate(today.getDate() + (i - 2)); // Spread across last 2 days to next 3 days
    
    // Create an overlapping appointment for Fernando
    await prisma.appointment.create({
      data: {
        clientId: client1.id,
        specialistId: spec2.id,
        serviceId: srv2.id,
        date: new Date(randomDay.setHours(13, 0, 0, 0)),
        sessionType: 'ONLINE',
        meetLink: 'https://meet.google.com/xyz-test',
        status: 'SCHEDULED',
        payment: { create: { userId: client1.id, amount: 50000, status: 'PENDING' } }
      }
    });

    // Create another overlapping for Maria Paz
    await prisma.appointment.create({
      data: {
        clientId: client2.id,
        specialistId: spec1.id,
        serviceId: srv1.id,
        date: new Date(randomDay.setHours(13, 30, 0, 0)),
        sessionType: 'IN_PERSON',
        status: 'COMPLETED',
        payment: { create: { userId: client2.id, amount: 35000, status: 'COMPLETED' } }
      }
    });
  }

  console.log('Hydration complete!');
  console.log('Admin:', admin.email, 'admin123');
  console.log('Coordinator:', coordinator.email, 'password123');
  console.log('Specialist:', spec1.email, 'password123');
  console.log('Client:', client1.email, 'password123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
