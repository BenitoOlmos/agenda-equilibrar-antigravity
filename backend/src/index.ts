import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

const app = express();

import authRouter from './routes/auth';
import apiRouter from './routes/api';

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/data', apiRouter);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
