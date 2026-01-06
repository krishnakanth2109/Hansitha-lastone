const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  messages: {
    type: [String],
    required: true,
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Announcement", announcementSchema);
