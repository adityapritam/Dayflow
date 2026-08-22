import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let firebaseApp = null;
let useFirebase = false;

// Resolve service account path relative to root directory
const serviceAccountPath = path.resolve('src/config/firebase-service-account.json');

if (fs.existsSync(serviceAccountPath)) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    // Check if JSON values are filled in
    if (serviceAccount.project_id && serviceAccount.project_id !== "YOUR_PROJECT_ID") {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      useFirebase = true;
      console.log('🔥 Firebase Admin initialized successfully!');
    } else {
      console.log('ℹ️ Firebase service account JSON contains default placeholders. Running in local JWT auth mode.');
    }
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin with service account:', err.message);
  }
} else {
  console.log('ℹ️ Firebase service account JSON not found. Running in local JWT auth mode.');
}

export { admin, useFirebase };
export default admin;
