const admin = require("firebase-admin");
const fs = require("fs");
require('dotenv/config'); 

try {
  const serviceAccount = JSON.parse(fs.readFileSync('/etc/secrets/serviceAccount.json', 'utf8'));

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
