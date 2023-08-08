import mongoose from 'mongoose';

const mongoURL =
  process.env.NODE_ENV === 'test'
    ? process.env.MONGO_URI_TEST
    : process.env.MONGO_URI;

if (!mongoURL) {
  console.error(
    'Error: MongoDB connection URI not found in .env file.'
  );
  process.exit(1);
}

mongoose
  .connect(mongoURL)
  .then(() => {
    console.log(
      `🛡  ${
        process.env.NODE_ENV === 'test' ? 'Test ' : ''
      }MongoDB connected successfully 🛡`
    );
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const closeMongoDBConnection = () => {
  mongoose.disconnect().then(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
};

process.on('SIGINT', closeMongoDBConnection);
process.on('SIGTERM', closeMongoDBConnection);
