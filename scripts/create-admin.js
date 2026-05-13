const path = require('path');
const fs = require('fs');

// Try to load .env.local manually for standalone scripts
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath });
}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.replace(/^--/, '').split('=');
      if (key && value) {
        parsed[key] = value;
      }
    }
  }
  return parsed;
}

function printUsage() {
  console.log(`
Usage: node scripts/create-admin.js --name="Admin Name" --email="admin@example.com" --password="securepassword"

Options:
  --name       Full name of the admin
  --email      Email address (must be unique)
  --password   Password for the admin account
`);
}

async function createAdmin() {
  const { name, email, password } = parseArgs();

  if (!name || !email || !password) {
    console.error('Error: Missing required arguments.');
    printUsage();
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Reuse the existing UserSchema as closely as possible
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'manager', 'member', 'user'],
      default: 'user',
    },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  }, { timestamps: true });

  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    console.log(`User with email "${email}" already exists.`);
    if (existingUser.role !== 'admin') {
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`Role upgraded to admin.`);
    } else {
      console.log(`User is already an admin.`);
    }
    console.log(`Name:  ${existingUser.name}`);
    console.log(`Email: ${existingUser.email}`);
    console.log(`Role:  ${existingUser.role}`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await User.create({
    name: name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'admin',
  });

  console.log('\n✅ Admin user created successfully!');
  console.log(`Name:  ${admin.name}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Role:  ${admin.role}`);

  await mongoose.disconnect();
}

createAdmin().catch(err => {
  console.error('❌ Error creating admin:', err.message);
  process.exit(1);
});
