const router = require("express").Router();
const Contact = require("../models/Contact");

// POST: Save a new message (Public)
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      message,
    });

    await newContact.save();

    res.status(201).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("Contact Error:", err);
    res.status(500).json({ message: "Server error, please try again." });
  }
});

// GET: Fetch all messages (Admin Only)
// Note: You should ideally add auth middleware here later
router.get("/", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// DELETE: Remove a message
router.delete("/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete message" });
  }
});

module.exports = router;