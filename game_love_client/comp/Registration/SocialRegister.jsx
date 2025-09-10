// comp/Registration/SocialRegister.jsx
import React, { useEffect, useState } from 'react';
import { Button, View, ActivityIndicator, Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase';

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID =
  '302885477032-n51csr8l7jtvnt0gf4jugju58nee2689.apps.googleusercontent.com';

export default function SocialRegister() {
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // ✅ נשארים עם ה-Proxy של Expo
    useProxy: true,
    redirectUri: makeRedirectUri({ useProxy: true }),
    projectNameForProxy: '@yehudagabbay/game_love_client',

    expoClientId: WEB_CLIENT_ID,       // נדרש ל-Expo Go
    androidClientId: WEB_CLIENT_ID,    // רק כדי לעבור את ה-invariant
    iosClientId: WEB_CLIENT_ID,        // אופציונלי (מומלץ להשלים)
  });

  useEffect(() => {
    // ודא שזה מתחיל ב-https://auth.expo.io/... ולא exp://...
    if (request?.url) console.log('auth request url:', request.url);
  }, [request]);

  useEffect(() => {
    (async () => {
      if (response?.type === 'success') {
        try {
          setLoading(true);
          const idToken = response.params?.id_token;
          const cred = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, cred);
          console.log('Google sign-in successful');
        } catch (e) {
          console.warn(e);
          Alert.alert('שגיאה', 'נכשלה התחברות Google');
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [response]);

  return (
    <View style={{ padding: 16 }}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button
          title="התחברות עם Google"
          onPress={() => promptAsync({ useProxy: true })} // כפייה גם בקריאה עצמה
          disabled={!request}
        />
      )}
    </View>
  );
}
