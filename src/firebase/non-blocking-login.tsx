'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { errorEmitter } from './error-emitter';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(error => {
    // Although we don't typically expect permission errors on anonymous sign-in,
    // it's good practice to handle potential issues like network errors or disabled anonymous auth.
    console.error("Anonymous Sign-In Error:", error);
    // You could potentially emit a generic 'auth-error' if needed
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch(error => {
    // This is a common place for auth errors (e.g., email-already-in-use)
    // We'll log them, but the UI form should handle displaying these to the user.
    console.error("Email Sign-Up Error:", error);
    // The form's onSubmit `catch` block is the primary handler for user feedback.
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch(error => {
    // This is a critical place for user-facing errors (e.g., wrong-password).
    console.error("Email Sign-In Error:", error);
    // The form's onSubmit `catch` block is the primary handler for user feedback.
    // The promise rejection will be caught there.
    throw error; // Re-throw to be caught by the calling form's try/catch.
  });
}

/** Initiate sign-out (non-blocking). */
export function initiateSignOut(authInstance: Auth): void {
    signOut(authInstance).catch(error => {
        console.error("Sign-Out Error:", error);
    });
}
