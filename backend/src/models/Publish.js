const mongoose = require('mongoose');

const publishSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    creativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creative', required: true },
    platform: { type: String, enum: ['Instagram', 'Facebook', 'Twitter'], required: true },
    status: { type: String, enum: ['Success', 'Failed'], default: 'Success' },
    time: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.model('Publish', publishSchema);

