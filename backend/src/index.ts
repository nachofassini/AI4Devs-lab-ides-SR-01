import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import candidateRoutes from './routes/candidates';
import { errorHandler } from './middleware/errorHandler';
import path from 'path';

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/candidates', candidateRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { prisma };
