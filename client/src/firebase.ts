// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Check if the API key exists before trying to use it
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// ⚠️ SAFETY CHECK: Only initialize if API key is present
// This prevents the "auth/invalid-api-key" crash
const app = apiKey ? initializeApp(firebaseConfig) : null;

// Export auth safely. If app is null, auth is null.
export const auth = app ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();

export default app;