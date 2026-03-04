import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

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
