const admin = require("firebase-admin");
require('dotenv/config');

let serviceAccount;

try {
  if(process.env.NODE_ENV === 'production'){
    serviceAccount = require('/etc/secrets/serviceAccount.json');
  }else{
    serviceAccount = require('../serviceAccount.json');
  }

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
