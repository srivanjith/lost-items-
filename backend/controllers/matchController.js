const db = require('../config/db');
const { compareItemsWithAI, verifySingleMatchWithAI } = require('../utils/gemini');

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

// Perform semantic AI matching comparison for a lost item against candidate found items
exports.getAIComparedMatches = async (req, res, next) => {
  try {
    const { lostItemId } = req.params;

    // Fetch lost item
    const [lostRows] = await db.query(
      `SELECT li.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
       FROM lost_items li
       JOIN users u ON li.user_id = u.id
       WHERE li.id = ?`,
      [lostItemId]
    );

    if (lostRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lost item not found.' });
    }
    const lostItem = lostRows[0];

    // Fetch candidate found items
    // We select active found items in the same category OR those that have a heuristic match already
    const [candidateFoundItems] = await db.query(
      `SELECT fi.*, u.name as finder_name, u.email as finder_email, u.phone as finder_phone
       FROM found_items fi
       JOIN users u ON fi.user_id = u.id
       WHERE fi.status = 'found' 
         AND (fi.category = ? OR fi.id IN (
           SELECT found_item_id FROM matches WHERE lost_item_id = ?
         ))
       LIMIT 30`,
      [lostItem.category, lostItemId]
    );

    if (candidateFoundItems.length === 0) {
      return res.json({
        success: true,
        count: 0,
        matches: []
      });
    }

    // Call Gemini utility
    const comparisons = await compareItemsWithAI(lostItem, candidateFoundItems);

    // Merge comparisons with actual found items details
    const comparedMatches = comparisons
      .map(comp => {
        const foundItem = candidateFoundItems.find(fi => fi.id === comp.found_item_id);
        if (!foundItem) return null;

        return {
          match_score: comp.similarity_score,
          match_analysis: comp.match_analysis,
          confidence: comp.confidence,
          lost_item: {
            id: lostItem.id,
            item_name: lostItem.item_name,
            category: lostItem.category,
            description: lostItem.description,
            image: lostItem.image,
            location: lostItem.location,
            date_lost: lostItem.date_lost,
            owner: {
              id: lostItem.user_id,
              name: lostItem.owner_name,
              email: lostItem.owner_email,
              phone: lostItem.owner_phone
            }
          },
          found_item: {
            id: foundItem.id,
            item_name: foundItem.item_name,
            category: foundItem.category,
            description: foundItem.description,
            image: foundItem.image,
            location: foundItem.location,
            date_found: foundItem.date_found,
            finder: {
              id: foundItem.user_id,
              name: foundItem.finder_name,
              email: foundItem.finder_email,
              phone: foundItem.finder_phone
            }
          }
        };
      })
      .filter(Boolean)
      // Sort by similarity score descending
      .sort((a, b) => b.match_score - a.match_score);

    res.json({
      success: true,
      count: comparedMatches.length,
      matches: comparedMatches
    });

  } catch (error) {
    next(error);
  }
};

// Deep 1-to-1 AI verification
exports.verifyMatchWithAI = async (req, res, next) => {
  try {
    const { lostItemId, foundItemId } = req.body;
    if (!lostItemId || !foundItemId) {
      return res.status(400).json({ success: false, message: 'Both lostItemId and foundItemId are required.' });
    }

    // Fetch lost item
    const [lostRows] = await db.query('SELECT * FROM lost_items WHERE id = ?', [lostItemId]);
    if (lostRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Lost item not found.' });
    }
    const lostItem = lostRows[0];

    // Fetch found item
    const [foundRows] = await db.query('SELECT * FROM found_items WHERE id = ?', [foundItemId]);
    if (foundRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Found item not found.' });
    }
    const foundItem = foundRows[0];

    // Call Gemini utility for deep 1-to-1 verify
    const analysis = await verifySingleMatchWithAI(lostItem, foundItem);

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    next(error);
  }
};

