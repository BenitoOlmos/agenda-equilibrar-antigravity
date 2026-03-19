import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // Limpiar toda la base de datos previa para evitar colisiones
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.programService.deleteMany();
  await prisma.program.deleteMany();
  await prisma.service.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('123456', 10);

  // 1. Crear Especialistas (Usando los colores requeridos en el Frontend)
  console.log('Creando especialistas...');
  const cat = await prisma.user.create({
    data: {
      email: 'catalina.reyes@clinicaequilibrar.cl', passwordHash: hash, role: 'SPECIALIST',
      profile: { create: { firstName: 'Catalina', lastName: 'Reyes', documentId: '12.345.678-9', specialty: 'Psicología', color: 'bg-[#3b82f6] border-[#2563eb] text-[#1e40af]' } }
    }
  });

  const andrea1 = await prisma.user.create({
    data: {
      email: 'andrea.fuenzalida@clinicaequilibrar.cl', passwordHash: hash, role: 'SPECIALIST',
      profile: { create: { firstName: 'Andrea', lastName: 'Fuenzalida', documentId: '13.456.789-0', specialty: 'Nutrición', color: 'bg-[#10b981] border-[#059669] text-[#064e3b]' } }
    }
  });

  const camilo = await prisma.user.create({
    data: {
      email: 'camilo.rodriguez@clinicaequilibrar.cl', passwordHash: hash, role: 'SPECIALIST',
      profile: { create: { firstName: 'Camilo', lastName: 'Rodríguez', documentId: '10.123.456-7', specialty: 'Masoterapia', color: 'bg-[#f59e0b] border-[#d97706] text-[#78350f]' } }
    }
  });

  // 2. Crear Pacientes con distintas Previsiones
  console.log('Creando pacientes...');
  const p1 = await prisma.user.create({
    data: {
      email: 'juan.perez@gmail.com', passwordHash: hash, role: 'CLIENT',
      profile: { create: { firstName: 'Juan', lastName: 'Pérez', documentId: '19.876.543-2', phone: '+56 9 8765 4321', healthSystem: 'ISAPRE Colmena', complementaryInsurance: 'MetLife' } }
    }
  });

  const p2 = await prisma.user.create({
    data: {
      email: 'maria.gonzalez@hotmail.com', passwordHash: hash, role: 'CLIENT',
      profile: { create: { firstName: 'Maria', lastName: 'González', documentId: '20.123.987-1', phone: '+56 9 1234 5678', healthSystem: 'FONASA B', complementaryInsurance: '' } }
    }
  });

  // 3. Crear Servicios Básicos
  console.log('Creando servicios...');
  const srvEvaluacion = await prisma.service.create({ data: { name: 'Evaluación Inicial (Nutricional)', description: 'Primera consulta para evaluación de peso y hábitos dietéticos.', duration: 45, price: 35000 } });
  const srvMasaje = await prisma.service.create({ data: { name: 'Sesión Masoterapia Relajante', description: 'Masaje anti-estrés cuerpo completo.', duration: 60, price: 40000 } });
  const srvManejoAnsiedad = await prisma.service.create({ data: { name: 'Consulta Psicología (Ansiedad)', description: 'Terapia cognitivo-conductual.', duration: 45, price: 45000 } });

  // 4. Crear Programas vinculados a esos servicios
  console.log('Creando programas médicos...');
  const progBienestar = await prisma.program.create({
    data: {
      name: 'Programa Bienestar Total',
      description: 'Paquete de Nutrición y Psicoterapia enfocado en cambiar tu relación con el cuerpo y la mente interconectada.',
      price: 135000,
      isActive: true,
      services: {
         create: [
           { service: { connect: { id: srvEvaluacion.id } } },
           { service: { connect: { id: srvManejoAnsiedad.id } } }
         ]
      }
    }
  });

  const progDetox = await prisma.program.create({
    data: {
      name: 'Plan Detox Físico y Emocional',
      description: 'Liberación de tensión muscular profunda a través de sesiones de masaje consecutivas y control de estrés psicológico.',
      price: 150000,
      isActive: true,
      services: {
         create: [
           { service: { connect: { id: srvMasaje.id } } },
           { service: { connect: { id: srvManejoAnsiedad.id } } }
         ]
      }
    }
  });

  // 5. Crear algunas citas con distintos pagos para popular estadísticas
  console.log('Creando historial de citas y pagos...');
  
  // Cita Ayer
  await prisma.appointment.create({
    data: {
      clientId: p1.id, specialistId: cat.id, serviceId: srvManejoAnsiedad.id, sessionType: 'IN_PERSON', 
      date: new Date(new Date().setDate(new Date().getDate() - 1)), status: 'COMPLETED',
      payment: { create: { userId: p1.id, amount: 45000, status: 'COMPLETED', paymentMethod: 'CASH' } }
    }
  });

  // Cita Hoy
  await prisma.appointment.create({
    data: {
      clientId: p2.id, specialistId: andrea1.id, serviceId: srvEvaluacion.id, sessionType: 'ONLINE', 
      date: new Date(new Date().setHours(new Date().getHours() + 2)), status: 'CONFIRMED',
      payment: { create: { userId: p2.id, amount: 35000, status: 'PENDING', paymentMethod: 'TRANSFER' } }
    }
  });

  // Cita Mañana
  await prisma.appointment.create({
    data: {
      clientId: p1.id, specialistId: camilo.id, serviceId: srvMasaje.id, sessionType: 'IN_PERSON', 
      date: new Date(new Date().setDate(new Date().getDate() + 1)), status: 'SCHEDULED',
      payment: { create: { userId: p1.id, amount: 40000, status: 'PENDING', paymentMethod: 'GATEWAY' } }
    }
  });

  console.log('✅ Base de datos hidratada correctamente con Información Clinica y Ofertada.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
