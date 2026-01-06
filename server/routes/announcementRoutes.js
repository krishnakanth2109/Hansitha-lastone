const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");

module.exports = (io) => {
  // GET /api/announcements
  router.get("/", async (req, res) => {
    try {
      let announcement = await Announcement.findOne();
      if (!announcement) {
        announcement = await Announcement.create({ messages: [], isActive: true });
      }
      res.status(200).json(announcement);
    } catch (err) {
      console.error("GET announcement error:", err);
      res.status(500).json({ error: "Failed to fetch announcement" });
    }
  });

  // POST /api/announcements
  router.post("/", async (req, res) => {
    const { messages, isActive } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid message format" });
    }

    try {
      let announcement = await Announcement.findOne();
      if (!announcement) {
        announcement = new Announcement({ messages, isActive });
      } else {
        announcement.messages = messages;
        announcement.isActive = isActive;
      }

      await announcement.save();
      io.emit("announcement:updated"); // <== Auto-refresh event
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("POST announcement error:", err);
      res.status(500).json({ error: "Failed to save announcement" });
    }
  });

  return router;
};
