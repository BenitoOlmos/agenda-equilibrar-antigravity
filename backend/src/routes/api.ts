import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

// GET all users (Admin/Coordinator views)
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    include: { profile: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(users);
});

// GET all appointments (Agenda view)
router.get('/appointments', async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    include: {
      client: { include: { profile: true } },
      specialist: { include: { profile: true } },
      service: true,
      payment: true
    },
    orderBy: { date: 'asc' }
  });
  res.json(appointments);
});

// GET all payments (Finance view)
router.get('/payments', async (req, res) => {
  const payments = await prisma.payment.findMany({
    include: {
      user: { include: { profile: true } },
      appointment: { include: { service: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(payments);
});

// GET overview stats for dashboard
router.get('/stats', async (req, res) => {
  const totalSpecialists = await prisma.user.count({ where: { role: 'SPECIALIST', isActive: true } });
  const totalClients = await prisma.user.count({ where: { role: 'CLIENT', isActive: true } });
  
  // Today's appointments
  const startOfDay = new Date();
  startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date();
  endOfDay.setHours(23,59,59,999);
  
  const todayAppointments = await prisma.appointment.count({
    where: { date: { gte: startOfDay, lte: endOfDay } }
  });

  res.json({
    specialists: totalSpecialists,
    clients: totalClients,
    appointmentsToday: todayAppointments
  });
});

// GET all services/programs (For Admin Services view)
router.get('/services', async (req, res) => {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: 'desc' }
  });
  res.json(services);
});

// POST to create user (Profile creation)
router.post('/users', express.json(), async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone, documentId, address, city, specialty, color, healthSystem, complementaryInsurance } = req.body;
    const hash = await bcrypt.hash(password || '123456', 10);
    const user = await prisma.user.create({
      data: {
        email, role, passwordHash: hash,
        profile: {
          create: { firstName, lastName, phone, documentId, address, city, specialty, color, healthSystem, complementaryInsurance }
        }
      },
      include: { profile: true }
    });
    res.json(user);
  } catch(e: any) { console.error(e); res.status(500).json({error: e.message || 'Failed to create user'}); }
});

// PUT to edit user (Profile update)
router.put('/users/:id', express.json(), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, firstName, lastName, phone, documentId, address, city, specialty, color, healthSystem, complementaryInsurance } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: {
        email, role,
        profile: {
          upsert: {
            create: { firstName, lastName, phone, documentId, address, city, specialty, color, healthSystem, complementaryInsurance },
            update: { firstName, lastName, phone, documentId, address, city, specialty, color, healthSystem, complementaryInsurance }
          }
        }
      },
      include: { profile: true }
    });
    res.json(user);
  } catch(e: any) { console.error(e); res.status(500).json({error: e.message || 'Failed to update user'}); }
});

// POST to create service
router.post('/services', express.json(), async (req, res) => {
  try {
    const { name, description, duration, price } = req.body;
    const srv = await prisma.service.create({
      data: { name, description, duration: Number(duration), price: Number(price) }
    });
    res.json(srv);
  } catch(e) { console.error(e); res.status(500).json({error: 'Failed to create service'}); }
});

// PUT to edit service
router.put('/services/:id', express.json(), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, price } = req.body;
    const srv = await prisma.service.update({
      where: { id },
      data: { name, description, duration: Number(duration), price: Number(price) }
    });
    res.json(srv);
  } catch(e: any) { console.error(e); res.status(500).json({error: e.message || 'Failed to update service'}); }
});

// DELETE to remove service
router.delete('/services/:id', async (req, res) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch(e: any) { console.error(e); res.status(500).json({error: e.message || 'Failed to delete service'}); }
});

// DELETE to remove user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch(e: any) { console.error(e); res.status(500).json({error: e.message || 'Failed to delete user'}); }
});
// POST to create appointment
router.post('/appointments', express.json(), async (req, res) => {
  try {
    const { clientId, specialistId, serviceId, date, sessionType, status } = req.body;
    const valService = await prisma.service.findUnique({ where: { id: serviceId }});
    const app = await prisma.appointment.create({
      data: {
        clientId, specialistId, serviceId, date: new Date(date), sessionType, status,
        payment: { create: { userId: clientId, amount: valService?.price || 0, status: 'PENDING' } }
      },
      include: { client: {include: {profile:true}}, specialist: {include: {profile:true}}, service: true }
    });
    res.json(app);
  } catch(e) { console.error(e); res.status(500).json({error: 'Failed to create appt'}); }
});

// PUT to edit payment status
router.put('/payments/:id', express.json(), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, amount, paymentMethod } = req.body;
    const data: any = {};
    if (status) data.status = status;
    if (amount !== undefined) data.amount = Number(amount);
    if (paymentMethod !== undefined) data.paymentMethod = paymentMethod;
    
    const payment = await prisma.payment.update({
       where: { id }, data,
       include: { user: { include: { profile: true } }, appointment: { include: { service: true } } }
    });
    res.json(payment);
  } catch(e) { console.error(e); res.status(500).json({error: 'Failed to update payment'}); }
});

// ====================== PROGRAMS ======================
router.get('/programs', async (req, res) => {
  try {
    const programs = await prisma.program.findMany({ include: { services: { include: { service: true } } } });
    res.json(programs);
  } catch (e) { console.error(e); res.status(500).json({error: 'Failed to fetch programs'}); }
});

router.post('/programs', express.json(), async (req, res) => {
  try {
    const { name, description, price, isActive, services } = req.body; // services is array of serviceId strings
    const program = await prisma.program.create({
      data: {
        name, description, price: Number(price), isActive: isActive !== undefined ? isActive : true,
        services: { create: (services || []).map((id: string) => ({ service: { connect: { id } } })) }
      },
      include: { services: { include: { service: true } } }
    });
    res.json(program);
  } catch (e) { console.error(e); res.status(500).json({error: 'Failed to create program'}); }
});

router.put('/programs/:id', express.json(), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, isActive, services } = req.body;
    if (services !== undefined) await prisma.programService.deleteMany({ where: { programId: id } });
    
    const program = await prisma.program.update({
      where: { id },
      data: {
        name, description,
        ...(price !== undefined && { price: Number(price) }),
        ...(isActive !== undefined && { isActive }),
        ...(services !== undefined && { services: { create: services.map((sId: string) => ({ service: { connect: { id: sId } } })) } })
      },
      include: { services: { include: { service: true } } }
    });
    res.json(program);
  } catch (e) { console.error(e); res.status(500).json({error: 'Failed to update program'}); }
});

router.delete('/programs/:id', async (req, res) => {
  try {
    await prisma.program.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch(e) { console.error(e); res.status(500).json({error: 'Failed to delete program'}); }
});

export default router;
