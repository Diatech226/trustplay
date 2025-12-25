import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../api/models/user.model.js';

dotenv.config();

const args = process.argv.slice(2);
const emailFlagIndex = args.findIndex((arg) => arg === '--email' || arg === '-e');
const email = emailFlagIndex >= 0 ? args[emailFlagIndex + 1] : args[0];

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required to run this script.');
  process.exit(1);
}

if (!email) {
  console.error('Usage: npm run make-admin -- --email someone@mail.com');
  process.exit(1);
}

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { role: 'ADMIN' } },
      { new: true }
    );

    if (!user) {
      console.error(`No user found for ${email}`);
      process.exitCode = 1;
      return;
    }

    console.log(`User ${user.email} is now ADMIN.`);
  } catch (error) {
    console.error('Make-admin failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

makeAdmin();
