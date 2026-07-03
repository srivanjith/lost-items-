const db = require('../config/db');

// Stopwords for cleaner text comparison
const stopwords = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'my', 'your', 
  'his', 'her', 'their', 'our', 'it', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'we', 'they', 'have', 'has', 'had', 'do', 'does'
]);

// Tokenizes text, removes punctuation and stopwords
function getTokens(str) {
  if (!str) return [];
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(token => token.length > 0 && !stopwords.has(token));
}

// Score calculator from 0 to 100
function calculateScore(lostItem, foundItem) {
  const name1 = lostItem.item_name || '';
  const name2 = foundItem.item_name || '';
  const desc1 = lostItem.description || '';
  const desc2 = foundItem.description || '';
  let nameScore = 0;

  // Brand mismatch check for electronic devices and gadgets
  const getNormalizedBrand = (text) => {
    const t = text.toLowerCase();
    if (t.includes('apple') || t.includes('iphone') || t.includes('macbook') || t.includes('ipad') || t.includes('airpods')) return 'apple';
    if (t.includes('samsung') || t.includes('galaxy')) return 'samsung';
    if (t.includes('oneplus')) return 'oneplus';
    if (t.includes('pixel') || t.includes('google pixel')) return 'google';
    if (t.includes('asus') || t.includes('tuf') || t.includes('rog')) return 'asus';
    if (t.includes('dell') || t.includes('inspiron') || t.includes('latitude')) return 'dell';
    if (t.includes('hp') || t.includes('pavilion')) return 'hp';
    if (t.includes('lenovo') || t.includes('thinkpad')) return 'lenovo';
    if (t.includes('acer') || t.includes('aspire')) return 'acer';
    return null;
  };

  const b1 = getNormalizedBrand(name1 + ' ' + desc1);
  const b2 = getNormalizedBrand(name2 + ' ' + desc2);

  if (b1 && b2 && b1 !== b2) {
    // If brand mismatch is detected, reject the match (score 0)
    return 0;
  }

  // 1. Category match (30%)
  let categoryScore = 0;
  if (
    lostItem.category && 
    foundItem.category && 
    lostItem.category.trim().toLowerCase() === foundItem.category.trim().toLowerCase()
  ) {
    categoryScore = 30;
  }

  // 2. Item Name match (25%)
  if (name1.trim().toLowerCase() === name2.trim().toLowerCase()) {
    nameScore = 25;
  } else {
    const tokens1 = getTokens(name1);
    const tokens2 = getTokens(name2);
    if (tokens1.length > 0 && tokens2.length > 0) {
      const intersection = tokens1.filter(t => tokens2.includes(t));
      const union = Array.from(new Set([...tokens1, ...tokens2]));
      const jaccard = intersection.length / union.length;
      nameScore = jaccard * 25;
      
      // Fallback substring check
      if (nameScore < 15 && (name1.toLowerCase().includes(name2.toLowerCase()) || name2.toLowerCase().includes(name1.toLowerCase()))) {
        nameScore = 15;
      }
    }
  }

  let descScore = 0;
  const descTokens1 = getTokens(desc1);
  const descTokens2 = getTokens(desc2);
  if (descTokens1.length > 0 && descTokens2.length > 0) {
    const intersection = descTokens1.filter(t => descTokens2.includes(t));
    const union = Array.from(new Set([...descTokens1, ...descTokens2]));
    descScore = (intersection.length / union.length) * 25;
  }

  // 4. Location match (20%)
  let locScore = 0;
  const loc1 = lostItem.location || '';
  const loc2 = foundItem.location || '';
  if (loc1.trim().toLowerCase() === loc2.trim().toLowerCase()) {
    locScore = 20;
  } else {
    const locTokens1 = getTokens(loc1);
    const locTokens2 = getTokens(loc2);
    if (locTokens1.length > 0 && locTokens2.length > 0) {
      const intersection = locTokens1.filter(t => locTokens2.includes(t));
      const union = Array.from(new Set([...locTokens1, ...locTokens2]));
      locScore = (intersection.length / union.length) * 20;
      if (locScore < 10 && intersection.length > 0) {
        locScore = 10;
      }
    }
  }

  return Math.min(100, Math.round(categoryScore + nameScore + descScore + locScore));
}

// Run matching checks for a single lost item
async function runMatchesForLostItem(lostItemId) {
  try {
    // Delete existing matches for this item
    await db.query('DELETE FROM matches WHERE lost_item_id = ?', [lostItemId]);

    // Fetch the lost item
    const [lostRows] = await db.query('SELECT * FROM lost_items WHERE id = ? AND status = "lost"', [lostItemId]);
    if (lostRows.length === 0) return;
    const lostItem = lostRows[0];

    // Fetch all active found items
    const [foundItems] = await db.query('SELECT * FROM found_items WHERE status = "found"');

    // Calculate and insert matches
    for (const foundItem of foundItems) {
      const score = calculateScore(lostItem, foundItem);
      if (score >= 35) {
        await db.query(
          'INSERT INTO matches (lost_item_id, found_item_id, match_score) VALUES (?, ?, ?)',
          [lostItemId, foundItem.id, score]
        );
      }
    }
  } catch (error) {
    console.error('Error running matches for lost item:', error);
  }
}

// Run matching checks for a single found item
async function runMatchesForFoundItem(foundItemId) {
  try {
    // Delete existing matches for this item
    await db.query('DELETE FROM matches WHERE found_item_id = ?', [foundItemId]);

    // Fetch the found item
    const [foundRows] = await db.query('SELECT * FROM found_items WHERE id = ? AND status = "found"', [foundItemId]);
    if (foundRows.length === 0) return;
    const foundItem = foundRows[0];

    // Fetch all active lost items
    const [lostItems] = await db.query('SELECT * FROM lost_items WHERE status = "lost"');

    // Calculate and insert matches
    for (const lostItem of lostItems) {
      const score = calculateScore(lostItem, foundItem);
      if (score >= 35) {
        await db.query(
          'INSERT INTO matches (lost_item_id, found_item_id, match_score) VALUES (?, ?, ?)',
          [lostItem.id, foundItemId, score]
        );
      }
    }
  } catch (error) {
    console.error('Error running matches for found item:', error);
  }
}

module.exports = {
  calculateScore,
  runMatchesForLostItem,
  runMatchesForFoundItem
};
