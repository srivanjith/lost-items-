const db = require('../config/db');

// Global Search endpoint
exports.searchItems = async (req, res, next) => {
  try {
    const { query, category, location, type } = req.query;
    
    const searchVal = query ? `%${query}%` : null;
    const categoryVal = category || null;
    const locationVal = location ? `%${location}%` : null;
    const reportType = type || 'all'; // 'lost', 'found', or 'all'

    let sql = '';
    let params = [];

    const lostSelect = `
      SELECT 
        'lost' as report_type,
        li.id,
        li.user_id,
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
      WHERE li.status = 'lost'
    `;

    const foundSelect = `
      SELECT 
        'found' as report_type,
        fi.id,
        fi.user_id,
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
      WHERE fi.status = 'found'
    `;

    if (reportType === 'lost') {
      sql = lostSelect;
    } else if (reportType === 'found') {
      sql = foundSelect;
    } else {
      sql = `(${lostSelect}) UNION (${foundSelect})`;
    }

    // Wrap in a subquery to apply filters easily
    let finalQuery = `SELECT * FROM (${sql}) AS search_results WHERE 1=1`;

    if (searchVal) {
      finalQuery += ` AND (item_name LIKE ? OR description LIKE ?)`;
      params.push(searchVal, searchVal);
    }

    if (categoryVal) {
      finalQuery += ` AND category = ?`;
      params.push(categoryVal);
    }

    if (locationVal) {
      finalQuery += ` AND location LIKE ?`;
      params.push(locationVal);
    }

    finalQuery += ` ORDER BY item_date DESC, created_at DESC`;

    const [results] = await db.query(finalQuery, params);

    res.json({
      success: true,
      count: results.length,
      items: results
    });

  } catch (error) {
    next(error);
  }
};
