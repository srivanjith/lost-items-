const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Get profile
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [users] = await db.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, currentPassword, newPassword } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, and phone are required.' });
    }

    // Check if email is already taken by another user
    const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already in use by another account.' });
    }

    // Get current user data
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = users[0];

    let query = 'UPDATE users SET name = ?, email = ?, phone = ?';
    let params = [name, email, phone];

    // Handle password update if newPassword is provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to change password.' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);

      query += ', password = ?';
      params.push(hashedNewPassword);
    }

    query += ' WHERE id = ?';
    params.push(userId);

    await db.query(query, params);

    // Fetch updated user
    const [updatedUsers] = await db.query('SELECT id, name, email, phone, role FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUsers[0]
    });

  } catch (error) {
    next(error);
  }
};
