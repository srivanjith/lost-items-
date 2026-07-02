const express = require('express');
const router = express.Router();
const lostController = require('../controllers/lostController');
const { authMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', authMiddleware, upload.single('image'), lostController.createLostItem);
router.get('/', lostController.getAllLostItems);
router.get('/:id', lostController.getLostItemById);
router.put('/:id', authMiddleware, upload.single('image'), lostController.updateLostItem);
router.delete('/:id', authMiddleware, lostController.deleteLostItem);

module.exports = router;
