const admin = require('../config/firebaseAdmin');
const db = require('../config/db');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No Firebase token provided.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decodedToken;

    const [rows] = await db.query(
      'SELECT id, name, email, phone, role FROM users WHERE email = ?',
      [decodedToken.email]
    );

    if (rows.length > 0) {
      req.user = rows[0];
    } else {
      req.user = null;
    }

    // Allow user to bypass local profile check ONLY if they are calling registration
    // We match the path for registration (e.g., matching /register in path)
    const isRegisterRoute = req.originalUrl.includes('/api/auth/register');

    if (!req.user && !isRegisterRoute) {
      return res.status(403).json({ 
        success: false, 
        message: 'Firebase account authenticated, but profile is not synchronized with campus database.' 
      });
    }

    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin access required.' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
