const db = require('../config/db');

// Sync Firebase User with MySQL registration
exports.register = async (req, res, next) => {
  try {
    const { name, phone, role } = req.body;
    
    // Check if Firebase token was verified
    if (!req.firebaseUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Firebase session not verified.' });
    }

    const { email } = req.firebaseUser;

    // Validation
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone are required.' });
    }

    // Determine role (default: student)
    const finalRole = (role === 'admin' || role === 'student') ? role : 'student';

    // Check if user already exists in MySQL
    const [existingUser] = await db.query('SELECT id, password FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      if (existingUser[0].password !== 'FIREBASE_AUTH') {
        // Migrate local user to Firebase auth
        await db.query(
          'UPDATE users SET password = "FIREBASE_AUTH", phone = ?, name = ? WHERE id = ?',
          [phone, name, existingUser[0].id]
        );
        return res.status(201).json({
          success: true,
          message: 'Local account migrated to Firebase successfully!',
          user: { id: existingUser[0].id, name, email, phone, role: finalRole }
        });
      }
      return res.status(400).json({ success: false, message: 'Email is already registered in local database.' });
    }

    // Insert user into MySQL. Since password is in Firebase, store a placeholder
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, "FIREBASE_AUTH", ?, ?)',
      [name, email, phone, finalRole]
    );

    const userId = result.insertId;

    res.status(201).json({
      success: true,
      message: 'Registration synchronized successfully!',
      user: { id: userId, name, email, phone, role: finalRole }
    });

  } catch (error) {
    next(error);
  }
};

// Sync validation for logging in
exports.login = async (req, res, next) => {
  try {
    // If authMiddleware successfully verified token and loaded req.user
    if (!req.user) {
      return res.status(403).json({ 
        success: false, 
        message: 'Firebase account authenticated, but profile is not synchronized with campus database.' 
      });
    }

    res.json({
      success: true,
      message: 'Authentication synchronized successfully!',
      user: req.user
    });

  } catch (error) {
    next(error);
  }
};
