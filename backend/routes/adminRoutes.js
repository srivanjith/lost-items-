const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);
router.get('/reports', authMiddleware, adminMiddleware, adminController.getAllReports);
router.delete('/report/:id', authMiddleware, adminMiddleware, adminController.deleteReport);

module.exports = router;
