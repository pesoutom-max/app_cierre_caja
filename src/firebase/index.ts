import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  const apps = getApps();
  if (apps.length > 0) {
    return { firebaseApp: apps[0] };
  }

  const firebaseApp = initializeApp(firebaseConfig);

  return { firebaseApp };
}

export {
  FirebaseProvider,
  FirebaseClientProvider,
} from './client-provider';

export {
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
} from './provider';
