import mongoose from 'mongoose';

const mongoURL = process.env.MONGO_URI;

if (!mongoURL) {
  console.error(
    'Error: MongoDB connection URI not found in .env file.'
  );
  process.exit(1);
}

mongoose
  .connect(mongoURL)
  .then(() => {
    console.log('🛡  MongoDB connected successfully 🛡');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
