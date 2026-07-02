const db = require('../config/db');
const { runMatchesForFoundItem } = require('../utils/matching');
const fs = require('fs');
const path = require('path');

// Create Found Item
exports.createFoundItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { item_name, category, description, location, date_found, contact_number } = req.body;

    if (!item_name || !category || !description || !location || !date_found || !contact_number) {
      // Cleanup uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const imageFilename = req.file ? req.file.filename : null;

    const [result] = await db.query(
      `INSERT INTO found_items (user_id, item_name, category, description, image, location, date_found, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'found')`,
      [userId, item_name, category, description, imageFilename, location, date_found]
    );

    const foundItemId = result.insertId;

    // Run matching checks
    await runMatchesForFoundItem(foundItemId);

    res.status(201).json({
      success: true,
      message: 'Found item reported successfully!',
      item: {
        id: foundItemId,
        user_id: userId,
        item_name,
        category,
        description,
        image: imageFilename,
        location,
        date_found,
        status: 'found'
      }
    });

  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(error);
  }
};

// Get All Found Items (With pagination and filters)
exports.getAllFoundItems = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { category, location, search, status } = req.query;

    let query = `
      SELECT fi.*, u.name as reporter_name, u.email as reporter_email, u.phone as reporter_phone 
      FROM found_items fi
      JOIN users u ON fi.user_id = u.id
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(*) as total FROM found_items WHERE 1=1`;
    let params = [];
    let countParams = [];

    // Filter by status
    if (status) {
      query += ` AND fi.status = ?`;
      countQuery += ` AND status = ?`;
      params.push(status);
      countParams.push(status);
    } else {
      query += ` AND fi.status = 'found'`;
      countQuery += ` AND status = 'found'`;
    }

    // Filter by category
    if (category) {
      query += ` AND fi.category = ?`;
      countQuery += ` AND category = ?`;
      params.push(category);
      countParams.push(category);
    }

    // Filter by location
    if (location) {
      query += ` AND fi.location LIKE ?`;
      countQuery += ` AND location LIKE ?`;
      params.push(`%${location}%`);
      countParams.push(`%${location}%`);
    }

    // Filter by search query (name or description)
    if (search) {
      query += ` AND (fi.item_name LIKE ? OR fi.description LIKE ?)`;
      countQuery += ` AND (item_name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    // Order by date_found desc, created_at desc
    query += ` ORDER BY fi.date_found DESC, fi.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [totalRows] = await db.query(countQuery, countParams);
    const total = totalRows[0].total;

    const [items] = await db.query(query, params);

    res.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items
    });

  } catch (error) {
    next(error);
  }
};

// Get Single Found Item
exports.getFoundItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT fi.*, u.name as reporter_name, u.email as reporter_email, u.phone as reporter_phone 
       FROM found_items fi
       JOIN users u ON fi.user_id = u.id
       WHERE fi.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Found item not found.' });
    }

    res.json({ success: true, item: rows[0] });
  } catch (error) {
    next(error);
  }
};

// Update Found Item
exports.updateFoundItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { item_name, category, description, location, date_found, status } = req.body;

    // Check if item exists and user has rights
    const [items] = await db.query('SELECT * FROM found_items WHERE id = ?', [id]);
    if (items.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: 'Found item not found.' });
    }

    const item = items[0];
    if (item.user_id !== userId && userRole !== 'admin') {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ success: false, message: 'Not authorized to update this item.' });
    }

    let query = `
      UPDATE found_items 
      SET item_name = ?, category = ?, description = ?, location = ?, date_found = ?, status = ?
    `;
    let params = [
      item_name || item.item_name,
      category || item.category,
      description || item.description,
      location || item.location,
      date_found || item.date_found,
      status || item.status
    ];

    if (req.file) {
      // Delete old image if exists
      if (item.image) {
        try {
          fs.unlinkSync(path.join(__dirname, '../uploads', item.image));
        } catch (e) {}
      }
      query += `, image = ?`;
      params.push(req.file.filename);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await db.query(query, params);

    // If status updated to 'resolved', delete associated matches
    if (status === 'resolved') {
      await db.query('DELETE FROM matches WHERE found_item_id = ?', [id]);
    } else if (status === 'found') {
      // Re-run matching in case fields changed or status set back to active
      await runMatchesForFoundItem(id);
    } else {
      // Just re-run matches if other fields updated but status is still 'found'
      await runMatchesForFoundItem(id);
    }

    const [updatedItems] = await db.query('SELECT * FROM found_items WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Found item updated successfully!',
      item: updatedItems[0]
    });

  } catch (error) {
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(error);
  }
};

// Delete Found Item
exports.deleteFoundItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const [items] = await db.query('SELECT * FROM found_items WHERE id = ?', [id]);
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Found item not found.' });
    }

    const item = items[0];
    if (item.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this item.' });
    }

    // Delete image file if exists
    if (item.image) {
      try {
        fs.unlinkSync(path.join(__dirname, '../uploads', item.image));
      } catch (e) {}
    }

    await db.query('DELETE FROM found_items WHERE id = ?', [id]);

    res.json({ success: true, message: 'Found item report deleted successfully!' });
  } catch (error) {
    next(error);
  }
};
