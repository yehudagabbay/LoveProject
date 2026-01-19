// comp/Registration/SocialRegister.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

import * as SecureStore from 'expo-secure-store';

import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase';

WebBrowser.maybeCompleteAuthSession();

// ה-IDs המדויקים שנלקחו מצילומי המסך שלך
const ANDROID_CLIENT_ID = '726714686390-ih3ov2p8o8kfjmfr3sn65p945t7nc0pg.apps.googleusercontent.com';
const WEB_CLIENT_ID = '726714686390-s7qsqqu51hhh3mq1srqj74s91907ls2c.apps.googleusercontent.com';

export default function SocialRegister({ navigation, route }) {
  const [loading, setLoading] = useState(true);

  // הגדרת ה-Redirect URI כך שיתאים למה שמוגדר ב-app.json
  const redirectUri = makeRedirectUri({ 
    scheme: 'loveclient', 
    path: 'oauthredirect' 
  });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    redirectUri,
    useProxy: false, // מכיוון שמשתמשים ב-Scheme מותאם אישית
  });

  const openedOnceRef = useRef(false);

  useEffect(() => {
    const provider = route?.params?.provider;

    if (provider !== 'Google') {
      setLoading(false);
      return;
    }

    if (!request) return;

    if (openedOnceRef.current) return;
    openedOnceRef.current = true;

    (async () => {
      try {
        setLoading(true);
        await promptAsync();
      } catch (e) {
        Alert.alert('שגיאה', 'לא הצלחנו לפתוח את התחברות Google');
        navigation.goBack();
      }
    })();
  }, [request, route?.params?.provider, promptAsync, navigation]);

  useEffect(() => {
    if (!response) return;

    console.log('Google auth response:', response.type);

    if (response.type === 'dismiss' || response.type === 'cancel') {
      Alert.alert('בוטל', 'התחברות Google בוטלה');
      navigation.goBack();
      return;
    }

    if (response.type === 'error') {
      const code = response?.params?.error || response?.error?.message || 'unknown_error';
      Alert.alert('שגיאה', `Google auth error: ${code}`);
      navigation.goBack();
      return;
    }

    if (response.type !== 'success') return;

    const idToken = response?.authentication?.idToken || response?.params?.id_token;

    if (!idToken) {
      Alert.alert('שגיאה', 'לא התקבל id_token. בדוק OAuth + Scheme/Redirect.');
      navigation.goBack();
      return;
    }

    (async () => {
      try {
        setLoading(true);

        const credential = GoogleAuthProvider.credential(idToken);
        const userCred = await signInWithCredential(auth, credential);

        const uid = userCred?.user?.uid || '';
        const firebaseIdToken = await userCred.user.getIdToken(true);

        // שמירה מאובטחת של פרטי המשתמש
        await SecureStore.setItemAsync('lg_firebase_uid', uid);
        await SecureStore.setItemAsync('lg_firebase_idToken', firebaseIdToken);

        const email = userCred?.user?.email || '';
        if (email) {
          await SecureStore.setItemAsync('lg_firebase_email', email);
        }

        Alert.alert('הצלחה', 'התחברת עם Google בהצלחה!', [
          {
            text: 'אישור',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'GameModeSelect' }],
              });
            },
          },
        ]);
      } catch (e) {
        console.warn('Firebase sign-in error:', e);
        Alert.alert('שגיאה', 'נכשלה התחברות Firebase');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [response, navigation]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#e91e63" />
    </View>
  );
}