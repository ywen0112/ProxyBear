const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }, 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['main', 'sub', 'admin'], default: 'main' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  credit: { type: Number, default: 0 },
  assignedGB:{ type: Number, default: 0 },
  usesPool: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.index({ role: 1, parent: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
