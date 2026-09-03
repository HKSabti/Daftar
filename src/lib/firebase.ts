import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || undefined);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Authentication functions with Real Google Auth & Cloud Firestore sync
export async function signInWithGoogleReal() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Save verified user in Firestore and backend session
    if (user) {
      const userPayload = {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'Google User',
        avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        provider: 'google',
        emailVerified: user.emailVerified
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userPayload,
        lastLoginAt: serverTimestamp()
      }, { merge: true });

      // Notify backend server of authenticated session
      await fetch('/api/auth/register-or-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0],
          provider: 'google',
          avatarUrl: user.photoURL
        })
      });

      return { success: true, user: userPayload };
    }
    return { success: false, error: 'No user returned from Google' };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    return { success: false, error: error.message || 'Google sign-in popup failed' };
  }
}

export async function signInWithAppleReal() {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    const user = result.user;

    if (user) {
      const userPayload = {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || 'Apple Scholar',
        avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        provider: 'apple',
        emailVerified: user.emailVerified
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userPayload,
        lastLoginAt: serverTimestamp()
      }, { merge: true });

      await fetch('/api/auth/register-or-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.uid,
          email: user.email,
          name: user.displayName || 'Apple Scholar',
          provider: 'apple',
          avatarUrl: user.photoURL
        })
      });

      return { success: true, user: userPayload };
    }
    return { success: false, error: 'No user returned from Apple' };
  } catch (error: any) {
    console.error('Apple Sign In Error:', error);
    return { success: false, error: error.message || 'Apple sign-in popup failed' };
  }
}

export async function logOutReal() {
  try {
    await signOut(auth);
    await fetch('/api/auth/logout', { method: 'POST' });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
