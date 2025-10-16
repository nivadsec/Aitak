'use client';
import {
  Auth,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { ROLES } from '@/lib/roles';

/** Initiate anonymous sign-in for a teacher (non-blocking). */
export async function initiateTeacherAnonymousSignIn(authInstance: Auth): Promise<void> {
  try {
    const userCredential = await signInAnonymously(authInstance);
    // After signing in, update the profile to set the teacher role.
    // This is crucial for the FirebaseProvider to correctly identify the user's role.
    await updateProfile(userCredential.user, {
        displayName: "معلم پیش‌فرض",
        photoURL: ROLES.TEACHER // Set role in photoURL
    });
  } catch (error) {
    console.error('Anonymous Teacher Sign-In Error:', error);
    // It's better to re-throw the error to be handled by the calling UI component
    throw error;
  }
}
