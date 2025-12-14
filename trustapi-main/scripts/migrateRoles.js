import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../api/models/user.model.js';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required to run the migration.');
  process.exit(1);
}

const LEGACY_ROLES = ['client', 'delivery'];

async function migrateRoles() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      { role: { $in: LEGACY_ROLES } },
      { $set: { role: 'USER' } }
    );

    console.log(`Updated ${result.modifiedCount} user(s) to role "USER".`);
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateRoles();
