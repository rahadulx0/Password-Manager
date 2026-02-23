import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  categories: [{
    value: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: String, required: true },
  }],
  webauthnCredentials: [{
    credentialID: String,
    credentialPublicKey: String,
    counter: Number,
    transports: [String],
    createdAt: Date,
  }],
}, { timestamps: true });

const DEFAULT_CATEGORIES = [
  { value: 'social', label: 'Social', icon: 'Globe' },
  { value: 'email', label: 'Email', icon: 'Mail' },
  { value: 'finance', label: 'Finance', icon: 'Landmark' },
  { value: 'shopping', label: 'Shopping', icon: 'ShoppingBag' },
  { value: 'work', label: 'Work', icon: 'Briefcase' },
  { value: 'entertainment', label: 'Entertainment', icon: 'Gamepad2' },
  { value: 'other', label: 'Other', icon: 'Key' },
];

userSchema.pre('save', function (next) {
  if (this.isNew && (!this.categories || this.categories.length === 0)) {
    this.categories = DEFAULT_CATEGORIES;
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
