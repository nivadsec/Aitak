// IMPORTANT: This script should be run manually to set up the initial admin user.
// You can run it with: `npm run db:seed`

import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from '../../firebase-service-account.json';
import { ROLES } from '../lib/roles';

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password';

console.log('Starting admin user seeding script...');

try {
  if (!admin.apps.length) {
    console.log('Initializing Firebase Admin SDK...');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  }

  const auth = admin.auth();
  const db = getFirestore();

  const ensureAdminExists = async () => {
    console.log(`Checking for admin user: ${ADMIN_EMAIL}`);
    try {
      // Check if user already exists
      const userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log(`Admin user ${ADMIN_EMAIL} already exists with UID: ${userRecord.uid}.`);
      
      // Ensure custom claim is set
      if (userRecord.customClaims?.['role'] !== ROLES.TEACHER) {
        console.log('Admin user exists but role is incorrect. Setting role...');
        await auth.setCustomUserClaims(userRecord.uid, { role: ROLES.TEACHER });
        console.log('Admin user role updated to "teacher".');
      }

    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // User does not exist, create them
        console.log('Admin user not found. Creating new admin user...');
        const newUser = await auth.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: 'مدیر سیستم',
          emailVerified: true,
        });

        console.log(`Successfully created new admin user: ${newUser.uid}`);

        // Set custom claim for teacher role
        await auth.setCustomUserClaims(newUser.uid, { role: ROLES.TEACHER });
        console.log('Set custom claim "role: teacher" for new admin user.');

        // Also create a document in the 'teachers' collection
        const teacherRef = db.collection('teachers').doc(newUser.uid);
        await teacherRef.set({
            id: newUser.uid,
            firstName: 'مدیر',
            lastName: 'سیستم',
            email: ADMIN_EMAIL,
        });
        console.log('Created Firestore document for the admin user.');

      } else {
        // Other error
        throw error;
      }
    }
  };

  ensureAdminExists().then(() => {
    console.log('Admin user seeding script finished successfully.');
    process.exit(0);
  }).catch((error) => {
    console.error('Error in admin seeding script:', error);
    process.exit(1);
  });

} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error);
  process.exit(1);
}
