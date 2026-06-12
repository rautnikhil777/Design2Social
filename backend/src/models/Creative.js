const mongoose = require('mongoose');

const creativeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    prompt: { type: String, required: true },
    type: { type: String, enum: ['Flyer', 'Reel'], required: true },
    quote: { type: String, default: '' },
    template: { type: String, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Creative', creativeSchema);

