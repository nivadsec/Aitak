
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, collection, doc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, getIdTokenResult } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';

import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { ROLES } from '@/lib/roles';
import { setDocumentNonBlocking } from './non-blocking-updates';
import type { LoginHistory } from '@/lib/types';
import { serverTimestamp } from 'firebase/firestore';
import { initiateAnonymousSignIn } from './non-blocking-login';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  role: string | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
  role: string | null;
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  role: string | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { // Renamed from UserAuthHookResult for consistency if desired, or keep as UserAuthHookResult
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  role: string | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);


// Helper function to log student login events
const initiateLoginHistory = (firestore: Firestore, user: User, role: string) => {
  if (role.startsWith(ROLES.STUDENT)) {
      const teacherId = role.split(':')[1];
      if (teacherId && teacherId !== 'unknown') {
          const historyCol = collection(firestore, 'teachers', teacherId, 'loginHistory');
          const newHistoryRef = doc(historyCol);
          const historyData: Omit<LoginHistory, 'id'> = {
              studentId: user.uid,
              studentName: user.displayName || 'نامشخص',
              email: user.email || 'نامشخص',
              timestamp: serverTimestamp(),
              type: 'login',
              status: 'success',
          };
          setDocumentNonBlocking(newHistoryRef, { ...historyData, id: newHistoryRef.id }, {});
      }
  }
};


/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
    role: null,
  });

  const router = useRouter();
  const pathname = usePathname();

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!auth || !firestore) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth or Firestore service not provided."), role: null });
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => { // Auth state determined
        if (firebaseUser && !firebaseUser.isAnonymous) {
          const idTokenResult = await getIdTokenResult(firebaseUser);
          const roleInfo = (idTokenResult.claims.role as string) || null;
          
          setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null, role: roleInfo });

          if (roleInfo) {
              initiateLoginHistory(firestore, firebaseUser, roleInfo);
          }

          // Redirect after successful login
          const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/teacher/login';
          if (isAuthPage && roleInfo) {
            if (roleInfo.startsWith(ROLES.TEACHER)) {
              router.push('/teacher/dashboard');
            } else if (roleInfo.startsWith(ROLES.STUDENT)) {
              router.push('/student/dashboard');
            }
          }
        } else {
           // User is either logged out or is anonymous.
           if (!firebaseUser && userAuthState.user) { // A real user just logged out
                setUserAuthState({ user: null, isUserLoading: false, userError: null, role: null });
           } else if (firebaseUser?.isAnonymous) { // Is anonymous
                setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null, role: null });
           } else { // Initial load, no user
               initiateAnonymousSignIn(auth);
               setUserAuthState({ user: null, isUserLoading: false, userError: null, role: null });
           }
        }
      },
      (error) => { // Auth listener error
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error, role: null });
      }
    );
    return () => unsubscribe(); // Cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, firestore]);

  // Effect to handle redirection for protected routes
  useEffect(() => {
    // Wait until the initial auth state is resolved
    if (userAuthState.isUserLoading) return;

    const isProtectedRoute = (pathname.startsWith('/teacher/') && pathname !== '/teacher/login') || pathname.startsWith('/student/');
    
    // If on a protected route and there's no real user (no role), redirect to login
    if (isProtectedRoute && !userAuthState.role) {
        if(pathname.startsWith('/teacher/')) {
            router.push('/teacher/login');
        } else {
            router.push('/login');
        }
    }

  }, [pathname, userAuthState.isUserLoading, userAuthState.role, router]);


  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      ...userAuthState
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
    role: context.role,
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

/**
 * A wrapper around `React.useMemo` that adds a non-enumerable property
 * to the memoized object. This helps `useCollection` and `useDoc` to verify
 * that their inputs have been correctly memoized, preventing performance issues.
 * @template T
 * @param {() => T} factory The function to compute the memoized value.
 * @param {DependencyList} deps An array of dependencies.
 * @returns {T} The memoized value.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;

  // Add a non-enumerable property to mark this object as memoized
  Object.defineProperty(memoized, '__memo', {
      value: true,
      writable: false,
      configurable: true,
      enumerable: false, 
  });
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => { // Renamed from useAuthUser
  const { user, isUserLoading, userError, role } = useFirebase(); // Leverages the main hook
  return { user, isUserLoading, userError, role };
};
