const express = require('express');
const router = express.Router();
const foundController = require('../controllers/foundController');
const { authMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', authMiddleware, upload.single('image'), foundController.createFoundItem);
router.get('/', foundController.getAllFoundItems);
router.get('/:id', foundController.getFoundItemById);
router.put('/:id', authMiddleware, upload.single('image'), foundController.updateFoundItem);
router.delete('/:id', authMiddleware, foundController.deleteFoundItem);

module.exports = router;
