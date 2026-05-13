const mongoose = require('mongoose');

// Generic content store used by /api/content/[section]
// Stores arbitrary JSON (as `data`) per `section`.

const contentSchema = new mongoose.Schema(
  {
    section: { type: String, required: true, unique: true, trim: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Content || mongoose.model('Content', contentSchema);

