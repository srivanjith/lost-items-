const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, matchController.getMatches);

module.exports = router;
