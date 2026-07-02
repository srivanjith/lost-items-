const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

const projectId = process.env.FIREBASE_PROJECT_ID || 'lost-found-portal-firebase';

if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: projectId
  });
  console.log('Firebase Admin SDK initialized successfully for project:', projectId);
}

module.exports = admin;
