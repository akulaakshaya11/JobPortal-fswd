import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/user.routes';
import { connectToDatabase } from './config/db';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/users', userRoutes);

connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

export default app;