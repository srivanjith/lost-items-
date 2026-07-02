const db = require('../config/db');

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // 1. Total active lost items
    const [lostCountRows] = await db.query('SELECT COUNT(*) as count FROM lost_items WHERE status = "lost"');
    const totalLost = lostCountRows[0].count;

    // 2. Total active found items
    const [foundCountRows] = await db.query('SELECT COUNT(*) as count FROM found_items WHERE status = "found"');
    const totalFound = foundCountRows[0].count;

    // 3. Matched items count (isolated by user unless admin)
    let matchesQuery = `
      SELECT COUNT(*) as count 
      FROM matches m
      JOIN lost_items li ON m.lost_item_id = li.id
      JOIN found_items fi ON m.found_item_id = fi.id
      WHERE li.status = 'lost' AND fi.status = 'found'
    `;
    let matchesParams = [];
    if (userRole !== 'admin') {
      matchesQuery += ` AND (li.user_id = ? OR fi.user_id = ?)`;
      matchesParams.push(userId, userId);
    }
    const [matchesCountRows] = await db.query(matchesQuery, matchesParams);
    const totalMatches = matchesCountRows[0].count;

    // 4. Recent reports (limit 5)
    const recentLostQuery = `
      SELECT 'lost' as report_type, id, item_name, category, location, date_lost as item_date, status, created_at 
      FROM lost_items 
      ORDER BY created_at DESC LIMIT 5
    `;
    const recentFoundQuery = `
      SELECT 'found' as report_type, id, item_name, category, location, date_found as item_date, status, created_at 
      FROM found_items 
      ORDER BY created_at DESC LIMIT 5
    `;
    const [recentReports] = await db.query(
      `(${recentLostQuery}) UNION (${recentFoundQuery}) ORDER BY created_at DESC LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalLost,
        totalFound,
        totalMatches
      },
      recentReports
    });

  } catch (error) {
    next(error);
  }
};
