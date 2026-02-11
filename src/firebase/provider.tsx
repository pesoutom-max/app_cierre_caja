'use client';

import { FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { createContext, useContext } from 'react';
import { Firestore, getFirestore } from 'firebase/firestore';

export type FirebaseContextValue = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

// Create a context to hold the Firebase services.
// We are providing a default value here but it should not be used directly.
// The context will be provided by the FirebaseProvider component.
const FirebaseContext = createContext<FirebaseContextValue | null>(null);

// This hook can be used by any component under the FirebaseProvider
// to get access to the Firebase services.
export const useFirebase = () => {
  return useContext(FirebaseContext);
};

// These hooks are just for convenience and type safety.
// They get the specific service from the context.
export const useFirebaseApp = () => useFirebase()?.firebaseApp;
export const useAuth = () => useFirebase()?.auth;
export const useFirestore = () => useFirebase()?.firestore;

// The provider component that will wrap our app.
// It initializes Firebase and makes the services available to the rest of the app.
export function FirebaseProvider({
  children,
  firebaseApp,
}: {
  children: React.ReactNode;
} & Omit<Partial<FirebaseContextValue>, 'auth' | 'firestore'>) {
  if (!firebaseApp) return <>{children}</>;

  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return (
    <FirebaseContext.Provider
      value={{
        firebaseApp,
        auth,
        firestore,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}
