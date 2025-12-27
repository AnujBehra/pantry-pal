const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all pantry items for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT pi.*, c.name as category_name, c.icon as category_icon
       FROM pantry_items pi
       LEFT JOIN categories c ON pi.category_id = c.id
       WHERE pi.user_id = $1
       ORDER BY pi.expiry_date ASC NULLS LAST`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get expiring items (within 3 days)
router.get('/expiring', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT pi.*, c.name as category_name, c.icon as category_icon
       FROM pantry_items pi
       LEFT JOIN categories c ON pi.category_id = c.id
       WHERE pi.user_id = $1 
         AND pi.expiry_date IS NOT NULL
         AND pi.expiry_date <= CURRENT_DATE + INTERVAL '3 days'
       ORDER BY pi.expiry_date ASC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add pantry item
router.post('/', authenticateToken, [
  body('name').trim().notEmpty(),
  body('quantity').optional().isNumeric(),
  body('unit').optional().trim(),
  body('category_id').optional().isInt(),
  body('expiry_date').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, quantity, unit, category_id, expiry_date } = req.body;
    
    const result = await db.query(
      `INSERT INTO pantry_items (user_id, name, quantity, unit, category_id, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, name, quantity || 1, unit || 'piece', category_id, expiry_date]
    );

    // Get the item with category info
    const itemResult = await db.query(
      `SELECT pi.*, c.name as category_name, c.icon as category_icon
       FROM pantry_items pi
       LEFT JOIN categories c ON pi.category_id = c.id
       WHERE pi.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json(itemResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update pantry item
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, unit, category_id, expiry_date } = req.body;

    const result = await db.query(
      `UPDATE pantry_items 
       SET name = COALESCE($1, name),
           quantity = COALESCE($2, quantity),
           unit = COALESCE($3, unit),
           category_id = COALESCE($4, category_id),
           expiry_date = COALESCE($5, expiry_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, quantity, unit, category_id, expiry_date, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Get the item with category info
    const itemResult = await db.query(
      `SELECT pi.*, c.name as category_name, c.icon as category_icon
       FROM pantry_items pi
       LEFT JOIN categories c ON pi.category_id = c.id
       WHERE pi.id = $1`,
      [result.rows[0].id]
    );

    res.json(itemResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete pantry item
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM pantry_items WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
