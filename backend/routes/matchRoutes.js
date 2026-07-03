const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, matchController.getMatches);
router.get('/ai-compare/:lostItemId', authMiddleware, matchController.getAIComparedMatches);
router.post('/ai-verify', authMiddleware, matchController.verifyMatchWithAI);

module.exports = router;
