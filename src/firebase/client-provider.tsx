'use client';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';

// This provider is responsible for ensuring Firebase is initialized on the client.
// It should be used as a wrapper around the root of your application.
// It composes the FirebaseProvider to make the initialized services available to the rest of the app.
export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseProvider {...initializeFirebase()}>{children}</FirebaseProvider>;
}
