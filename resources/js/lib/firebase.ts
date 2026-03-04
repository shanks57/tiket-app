import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBpqyX_UZR3ju7GZC7OJoRm0pAgpkKzeyA",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "siperkasaapp.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "siperkasaapp",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "siperkasaapp.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "561606299801",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:561606299801:web:144b0f3d36f68ceabce808"
};

console.log('[FIREBASE] Init Config:', firebaseConfig);

if (!firebaseConfig.projectId) {
    console.warn('[FIREBASE] WARNING: projectId is missing from config!');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Messaging and get a reference to the service
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

/**
 * Request permission and get registration token
 */
export const requestForToken = async (passedVapidKey?: string) => {
    if (!messaging) return null;

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.error('[FIREBASE] Notification permission denied');
            return null;
        }

        const currentToken = await getToken(messaging, {
            vapidKey: passedVapidKey || import.meta.env.VITE_FIREBASE_VAPID_KEY
        });

        if (currentToken) {
            return currentToken;
        } else {
            console.log('[FIREBASE] No registration token available');
            return null;
        }
    } catch (err) {
        console.error('[FIREBASE] Get token failed: ', err);
        return null;
    }
};

/**
 * Handle foreground messages
 */
export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return;
        onMessage(messaging, (payload) => {
            console.log("[FIREBASE] Message received in foreground: ", payload);
            resolve(payload);
        });
    });

export default app;
