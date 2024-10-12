const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");
require('dotenv/config');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DATABASE_URL
  });
  console.log("Firebase Admin SDK initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

const db = admin.database();

module.exports = db;
