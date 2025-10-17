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
export async function initiateAnonymousSignIn(authInstance: Auth): Promise<void> {
  try {
    await signInAnonymously(authInstance);
  } catch (error) {
    console.error('Anonymous Sign-In Error:', error);
    // errorEmitter.emit('auth-error', error);
  }
}

/** Initiate email/password sign-up (non-blocking). */
export async function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    return userCredential;
  } catch (error) {
    console.error('Email Sign-Up Error:', error);
    throw error; // Allow the form to handle the error
  }
}

/** Initiate email/password sign-in (non-blocking + safe). */
export async function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string
): Promise<void> {
  if (!authInstance) throw new Error('Auth instance not initialized');

  try {
    await signInWithEmailAndPassword(authInstance, email, password);
  } catch (error) {
    console.error('Email Sign-In Error:', error);
    throw error; // This will actually be caught by the form's try/catch
  }
}

/** Initiate sign-out (non-blocking). */
export async function initiateSignOut(authInstance: Auth): Promise<void> {
  try {
    await signOut(authInstance);
  } catch (error) {
    console.error('Sign-Out Error:', error);
    // errorEmitter.emit('auth-error', error);
  }
}
