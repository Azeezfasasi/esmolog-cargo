import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee', 'client', 'agent'], default: 'client' },
  gender: { type: String },
  phoneNumber: { type: String },
  homeAddress: { type: String },
  country: { type: String },
  state: { type: String },
  isDisabled: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  profileImageUrl: {
    type: String,
    default: null 
  }
}, { timestamps: true });

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
