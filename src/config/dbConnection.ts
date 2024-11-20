import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/lvnews'); // No need for extra options
    console.log('DB Connected');
  } catch (error) {
    console.error('DB Connection Error:', error);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
