const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  
  // Define User schema inline for seeding
  const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['admin', 'member', 'manager', 'user'], default: 'user' },
  }, { timestamps: true });
  
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  
  // Check if admin exists
  const existing = await User.findOne({ email: 'admin@esmolog.com' });
  if (existing) {
    console.log('Admin user already exists');
    console.log('Email: admin@esmolog.com');
    console.log('Password: admin123');
    await mongoose.disconnect();
    return;
  }
  
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@esmolog.com',
    password: hashedPassword,
    role: 'admin',
  });
  
  console.log('Admin user created successfully!');
  console.log('Email: admin@esmolog.com');
  console.log('Password: admin123');
  
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
