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

// ✅ Expo Go / Web (אצלך יכול להיות אותו ID)
const EXPO_CLIENT_ID =
  '726714686390-df2iqb16cka5pccs3qspk1ermi6occ75.apps.googleusercontent.com';

const WEB_CLIENT_ID =
  '726714686390-df2iqb16cka5pccs3qspk1ermi6occ75.apps.googleusercontent.com';

// ✅ Android OAuth Client ID שיצרת (חובה ל-native)
const ANDROID_CLIENT_ID =
  '726714686390-ih3ov2p8o8kfjmfr3sn65p945t7nc0pg.apps.googleusercontent.com';

export default function SocialRegister({ navigation, route }) {
  const [loading, setLoading] = useState(true);

  // ✅ חייב להיות זהה ל-app.json -> expo.scheme
  // אצלך: "scheme": "loveclient"
  const redirectUri = makeRedirectUri({ scheme: 'loveclient',
    native: 'com.liba.game:/oauth2redirect',
   });
  console.log("REDIRECT URI:", redirectUri);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    expoClientId: EXPO_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    redirectUri,
    useProxy: false, 
  });

  // ✅ כדי שלא יפתח 2 פעמים
  const openedOnceRef = useRef(false);

  // ✅ פתיחה אוטומטית של חלון Google כשנכנסים למסך
  useEffect(() => {
    const provider = route?.params?.provider;

    // אם הגיעו בלי provider=Google, אין מה לעשות פה
    if (provider !== 'Google') {
      setLoading(false);
      return;
    }

    // מחכים ש-request יהיה מוכן
    if (!request) return;

    // פותחים פעם אחת בלבד
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

  // ✅ טיפול בתשובת גוגל
  useEffect(() => {
    if (!response) return;

    // המשתמש ביטל
    if (response.type === 'dismiss' || response.type === 'cancel') {
      Alert.alert('בוטל', 'התחברות Google בוטלה');
      navigation.goBack();
      return;
    }

    if (response.type !== 'success') return;

    const idToken = response?.params?.id_token;

    if (!idToken) {
      Alert.alert('שגיאה', 'לא התקבל id_token. בדוק OAuth + Scheme/Redirect.');
      navigation.goBack();
      return;
    }

    (async () => {
      try {
        setLoading(true);

        // 1) Firebase Sign-in
        const credential = GoogleAuthProvider.credential(idToken);
        const userCred = await signInWithCredential(auth, credential);

        // 2) UID + Firebase ID Token (הטוקן לשמירה)
        const uid = userCred?.user?.uid || '';
        const firebaseIdToken = await userCred.user.getIdToken(true);

        // 3) שמירה ב-SecureStore
        await SecureStore.setItemAsync('lg_firebase_uid', uid);
        await SecureStore.setItemAsync('lg_firebase_idToken', firebaseIdToken);

        // אופציונלי: גם אימייל
        const email = userCred?.user?.email || '';
        if (email) {
          await SecureStore.setItemAsync('lg_firebase_email', email);
        }

        // ✅ אם אתה רוצה לקבל גם UserID מהשרת שלך (SQL) — תוסיף פה fetch ל-social-login שלך.
        // (אם תשלח לי את ה-endpoint המדויק שלך, אני אכניס אותו “בול” לקוד)

        Alert.alert('הצלחה', 'התחברת עם Google בהצלחה!', [
          {
            text: 'אישור',
            onPress: () => {
              // ניווט למסך הבא (תתאים אם אצלך צריך params)
              navigation.reset({
                index: 0,
                routes: [{ name: 'GameModeSelect' }],
              });
            },
          },
        ]);
      } catch (e) {
        console.warn('Firebase sign-in error:', e);
        Alert.alert('שגיאה', 'נכשלה התחברות Google');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [response, navigation]);

  // ✅ מסך טעינה בלבד (כי לא רוצים כפתור)
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
