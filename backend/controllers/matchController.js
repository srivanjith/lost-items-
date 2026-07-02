const db = require('../config/db');

// Get all matches for the logged-in user or all matches if admin
exports.getMatches = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT 
        m.id AS match_id,
        m.match_score,
        m.created_at AS match_date,
        
        li.id AS lost_id,
        li.item_name AS lost_name,
        li.category AS lost_category,
        li.description AS lost_description,
        li.image AS lost_image,
        li.location AS lost_location,
        li.date_lost AS lost_date,
        li.status AS lost_status,
        u1.id AS owner_id,
        u1.name AS owner_name,
        u1.email AS owner_email,
        u1.phone AS owner_phone,
        
        fi.id AS found_id,
        fi.item_name AS found_name,
        fi.category AS found_category,
        fi.description AS found_description,
        fi.image AS found_image,
        fi.location AS found_location,
        fi.date_found AS found_date,
        fi.status AS found_status,
        u2.id AS finder_id,
        u2.name AS finder_name,
        u2.email AS finder_email,
        u2.phone AS finder_phone
        
      FROM matches m
      JOIN lost_items li ON m.lost_item_id = li.id
      JOIN found_items fi ON m.found_item_id = fi.id
      JOIN users u1 ON li.user_id = u1.id
      JOIN users u2 ON fi.user_id = u2.id
      WHERE li.status = 'lost' AND fi.status = 'found'
    `;

    let params = [];

    // Filter matches if not admin (only show matches where user is either the owner or the finder)
    if (userRole !== 'admin') {
      query += ` AND (li.user_id = ? OR fi.user_id = ?)`;
      params.push(userId, userId);
    }

    query += ` ORDER BY m.match_score DESC, m.created_at DESC`;

    const [matches] = await db.query(query, params);

    // Format matches for convenient frontend consumption
    const formattedMatches = matches.map(match => ({
      match_id: match.match_id,
      match_score: parseFloat(match.match_score),
      match_date: match.match_date,
      lost_item: {
        id: match.lost_id,
        item_name: match.lost_name,
        category: match.lost_category,
        description: match.lost_description,
        image: match.lost_image,
        location: match.lost_location,
        date_lost: match.lost_date,
        status: match.lost_status,
        owner: {
          id: match.owner_id,
          name: match.owner_name,
          email: match.owner_email,
          phone: match.owner_phone
        }
      },
      found_item: {
        id: match.found_id,
        item_name: match.found_name,
        category: match.found_category,
        description: match.found_description,
        image: match.found_image,
        location: match.found_location,
        date_found: match.found_date,
        status: match.found_status,
        finder: {
          id: match.finder_id,
          name: match.finder_name,
          email: match.finder_email,
          phone: match.finder_phone
        }
      }
    }));

    res.json({
      success: true,
      count: formattedMatches.length,
      matches: formattedMatches
    });

  } catch (error) {
    next(error);
  }
};
