// server/routes/categories.js
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, image } = req.body;
    const newCategory = new Category({ name, image });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create category' });
  }
});

// ✅ PUT /api/categories/:id - Update Category
router.put('/:id', async (req, res) => {
  try {
    const { name, image } = req.body;
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, image },
      { new: true } // Returns the updated document
    );
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;