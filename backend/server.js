import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import applicationsRoutes from './routes/applications.js';
import adopterRoutes from './routes/adopter.js';

import { protect } from './middleware/auth.js';
import { authorizeRoles } from './middleware/roles.js';

dotenv.config();
connectDB();

const app = express();
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

app.get('/', (req, res) => res.send('PAWdoption Backend is running'));

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/adopter', adopterRoutes);

// Example admin-only route
app.get('/api/admin/only', protect, authorizeRoles('admin'), (req, res) => {
  res.send({ message: 'Welcome PAWdoption Admin!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));