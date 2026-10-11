import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing. Add it to backend/.env or your hosting secrets.');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    maxPoolSize: 10,
    autoIndex: process.env.NODE_ENV !== 'production',
  });
  console.info(`MongoDB connected (${mongoose.connection.name || 'database'}).`);
}
