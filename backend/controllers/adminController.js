const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Get all users (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// Get all reports (Admin only)
exports.getAllReports = async (req, res, next) => {
  try {
    const lostQuery = `
      SELECT 
        'lost' as report_type,
        li.id,
        li.item_name,
        li.category,
        li.description,
        li.image,
        li.location,
        li.date_lost as item_date,
        li.status,
        li.created_at,
        u.name as reporter_name,
        u.email as reporter_email,
        u.phone as reporter_phone
      FROM lost_items li
      JOIN users u ON li.user_id = u.id
    `;

    const foundQuery = `
      SELECT 
        'found' as report_type,
        fi.id,
        fi.item_name,
        fi.category,
        fi.description,
        fi.image,
        fi.location,
        fi.date_found as item_date,
        fi.status,
        fi.created_at,
        u.name as reporter_name,
        u.email as reporter_email,
        u.phone as reporter_phone
      FROM found_items fi
      JOIN users u ON fi.user_id = u.id
    `;

    const [reports] = await db.query(
      `(${lostQuery}) UNION (${foundQuery}) ORDER BY created_at DESC`
    );

    res.json({ success: true, count: reports.length, reports });
  } catch (error) {
    next(error);
  }
};

// Delete any report (Admin only)
exports.deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'lost' or 'found'

    let targetType = type;

    // If type is not provided, auto-detect it
    if (!targetType) {
      const [lostCheck] = await db.query('SELECT id FROM lost_items WHERE id = ?', [id]);
      if (lostCheck.length > 0) {
        targetType = 'lost';
      } else {
        const [foundCheck] = await db.query('SELECT id FROM found_items WHERE id = ?', [id]);
        if (foundCheck.length > 0) {
          targetType = 'found';
        } else {
          return res.status(404).json({ success: false, message: 'Report not found in lost or found databases.' });
        }
      }
    }

    if (targetType === 'lost') {
      const [items] = await db.query('SELECT image FROM lost_items WHERE id = ?', [id]);
      if (items.length === 0) {
        return res.status(404).json({ success: false, message: 'Lost report not found.' });
      }
      
      const image = items[0].image;
      if (image) {
        try { fs.unlinkSync(path.join(__dirname, '../uploads', image)); } catch (e) {}
      }

      await db.query('DELETE FROM lost_items WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Lost item report deleted by administrator.' });

    } else if (targetType === 'found') {
      const [items] = await db.query('SELECT image FROM found_items WHERE id = ?', [id]);
      if (items.length === 0) {
        return res.status(404).json({ success: false, message: 'Found report not found.' });
      }

      const image = items[0].image;
      if (image) {
        try { fs.unlinkSync(path.join(__dirname, '../uploads', image)); } catch (e) {}
      }

      await db.query('DELETE FROM found_items WHERE id = ?', [id]);
      return res.json({ success: true, message: 'Found item report deleted by administrator.' });
    }

    res.status(400).json({ success: false, message: 'Invalid report type specified.' });

  } catch (error) {
    next(error);
  }
};
