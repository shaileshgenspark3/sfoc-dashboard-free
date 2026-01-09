import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Participant from '../models/Participant.js';

let mongod: any = null;

export const connectDB = async () => {
  let dbUrl = process.env.MONGODB_URI;

  const startInMemory = async () => {
    console.log('⚠️  Production DB unreachable. Starting In-Memory Database...');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log(`📝 In-Memory Database Active at: ${uri}`);
    return uri;
  };

  // If no URI or placeholder, start in-memory immediately
  if (!dbUrl || dbUrl.includes('username:password')) {
    dbUrl = await startInMemory();
  }

  if (!dbUrl) {
      console.error('❌ Fatal: Database URL is undefined.');
      process.exit(1);
  }

  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(dbUrl, { 
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000 
    });
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error: any) {
    console.error(`❌ Connection Failed: ${error.message}`);
    
    // If we haven't tried in-memory yet, do it now
    if (!mongod) {
      try {
        dbUrl = await startInMemory();
        await mongoose.connect(dbUrl!);
        console.log(`✅ Fallback: MongoDB Connected (In-Memory)`);
      } catch (fallbackError: any) {
        console.error(`❌ Fatal Database Error: ${fallbackError.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }

  // Seed Data
  await seedDatabase();
};

const seedDatabase = async () => {
  const testCode = 'TEST01';
  try {
    const exists = await Participant.findOne({ individualCode: testCode });
    if (!exists) {
      await Participant.create({
        name: 'Demo Athlete',
        email: 'demo@sukrutparivar.com',
        mobile: '+1234567890',
        individualCode: testCode,
        activityType: 'Running', 
        isActive: true,
        streakDays: 0,
        totalDistance: 0,
        totalDuration: 0
      });
      console.log(`🌱 Database Seeded! Use Code: ${testCode}`);
    }
  } catch (error) {
    console.error('Seed Error:', error);
  }
};