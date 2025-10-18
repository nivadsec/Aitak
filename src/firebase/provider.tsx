
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

  useEffect(() => {
    if (!auth || !firestore) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth or Firestore service not provided."), role: null });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const idTokenResult = await getIdTokenResult(firebaseUser);
            const roleInfo = (idTokenResult.claims.role as string) || null;
            setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null, role: roleInfo });
            if (roleInfo) {
              initiateLoginHistory(firestore, firebaseUser, roleInfo);
            }
        } else {
            setUserAuthState({ user: null, isUserLoading: false, userError: null, role: null });
        }
    }, (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error, role: null });
    });

    return () => unsubscribe();
  }, [auth, firestore]);
  
  const { user, isUserLoading, role } = userAuthState;
  
  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until auth state is determined
    }

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/teacher/login');
    const isStudentPage = pathname.startsWith('/student');
    const isTeacherPage = pathname.startsWith('/teacher');

    if (user && role) {
      // User is logged in
      if (role === ROLES.TEACHER && isAuthPage) {
        router.push('/teacher/dashboard');
      } else if (role.startsWith(ROLES.STUDENT) && isAuthPage) {
        router.push('/student/dashboard');
      }
    } else {
      // User is not logged in
      if (isStudentPage || isTeacherPage) {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, role, pathname, router]);

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

export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;

  Object.defineProperty(memoized, '__memo', {
      value: true,
      writable: false,
      configurable: true,
      enumerable: false, 
  });
  
  return memoized;
}

export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError, role } = useFirebase();
  return { user, isUserLoading, userError, role };
};
