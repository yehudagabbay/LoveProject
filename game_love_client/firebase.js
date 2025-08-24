// game_love_client/firebase.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// הכנס את הערכים מה-Firebase Console שלך:
const firebaseConfig = {
  apiKey: "AIzaSyCZVTEhlKis9PZPE-UcuFqDU2xrxsVhSOc",
  authDomain: "lovegame-d5319.firebaseapp.com",
   projectId: "lovegame-d5319",
    appId: "1:302885477032:web:d3bb3cb23bf59d2d32409d",
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
