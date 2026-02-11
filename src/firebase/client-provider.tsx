'use client';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';
import React from 'react';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';

// This provider is responsible for ensuring Firebase is initialized on the client.
// It should be used as a wrapper around the root of your application.
// It composes the FirebaseProvider to make the initialized services available to the rest of the app.
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseApp } = initializeFirebase();

  React.useEffect(() => {
    if (!firebaseApp) return;

    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If no user is signed in, sign in anonymously.
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed", error);
        });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [firebaseApp]);

  return <FirebaseProvider firebaseApp={firebaseApp}>{children}</FirebaseProvider>;
}
