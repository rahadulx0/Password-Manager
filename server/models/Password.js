import mongoose from 'mongoose';

const passwordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
    default: '',
  },
  username: {
    type: String,
    trim: true,
    default: '',
  },
  password: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['social', 'email', 'finance', 'shopping', 'work', 'entertainment', 'other'],
    default: 'other',
  },
  favorite: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model('Password', passwordSchema);
