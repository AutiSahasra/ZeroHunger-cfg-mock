const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zerohunger';
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'zerohunger',
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[Database] Connected to MongoDB database: "${conn.connection.name}" on ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[Database Warning] MongoDB connection failed: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
