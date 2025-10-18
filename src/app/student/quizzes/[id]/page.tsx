'use server';

import * as admin from 'firebase-admin';
import { ROLES } from '@/lib/roles';

// In environments like Firebase Hosting, the SDK can discover credentials
// automatically. In a local environment, we need to load them manually.
const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY;

if (!admin.apps.length) {
  try {
    if (serviceAccountKey) {
      // Running in a local or CI environment with an explicit key
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Running on Google Cloud (e.g., Firebase App Hosting)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error);
    // We don't throw an error here, but the functions below will fail
    // and return a user-friendly error to the client.
  }
}

/**
 * A Server Action to create a new Firebase Authentication user for a student.
 * @param email The student's email.
 * @param password The student's password.
 * @param displayName The student's full name.
 * @param teacherId The teacher's UID.
 * @returns {Promise<{success: boolean, uid?: string, error?: string}>}
 */
export async function createStudentAuth(email: string, password: string, displayName: string, teacherId: string) {
    if (!admin.apps.length) {
      return { success: false, error: 'Firebase Admin SDK مقداردهی اولیه نشده است.' };
    }
     if (!email || !password || password.length < 8 || !displayName || !teacherId) {
        return { success: false, error: 'اطلاعات ورودی نامعتبر است.' };
    }

    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName,
            emailVerified: true, // Automatically verify email for teacher-created accounts
            photoURL: `${ROLES.STUDENT}:${teacherId}`
        });
        return { success: true, uid: userRecord.uid };
    } catch (error: any) {
        console.error('Error creating student auth user:', error);
        let errorMessage = 'یک خطای ناشناخته در سرور رخ داد.';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'این ایمیل قبلاً در سیستم ثبت شده است.';
        } else if (error.code === 'auth/invalid-password') {
            errorMessage = 'رمز عبور انتخاب شده ضعیف است. لطفاً از رمز قوی‌تری استفاده کنید.';
        }
        return { success: false, error: errorMessage };
    }
}


/**
 * A Server Action to update a student's password using the Firebase Admin SDK.
 * This is a secure way to perform privileged operations.
 *
 * @param {string} studentUid The UID of the student whose password needs to be changed.
 * @param {string} newPassword The new password for the student.
 * @returns {Promise<{success: boolean, error?: string}>} An object indicating success or failure.
 */
export async function updateStudentPassword(
  studentUid: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  // Basic validation
  if (!studentUid || !newPassword || newPassword.length < 8) {
    return {
      success: false,
      error: 'شناسه دانش‌آموز یا رمز عبور نامعتبر است. رمز عبور باید حداقل ۸ کاراکتر باشد.',
    };
  }
  
  if (!admin.apps.length) {
      return { success: false, error: 'Firebase Admin SDK مقداردهی اولیه نشده است.' };
  }

  try {
    // Use the Admin SDK to update the user's password
    await admin.auth().updateUser(studentUid, {
      password: newPassword,
    });
    
    return { success: true };

  } catch (error: any) {
    console.error(`Failed to update password for UID ${studentUid}:`, error);

    // Provide a more user-friendly error message
    let errorMessage = 'یک خطای ناشناخته در سرور رخ داد.';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'کاربر مورد نظر یافت نشد.';
    } else if (error.code === 'auth/invalid-password') {
        errorMessage = 'رمز عبور انتخاب شده ضعیف است. لطفاً از رمز قوی‌تری استفاده کنید.'
    }

    return { success: false, error: errorMessage };
  }
}