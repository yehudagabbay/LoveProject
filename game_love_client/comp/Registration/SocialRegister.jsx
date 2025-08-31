import React from 'react';
import { Button } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase';

WebBrowser.maybeCompleteAuthSession();

export default function SocialRegister() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    expoClientId: '302885477032-n51csr8l7jtvnt0gf4jugju58nee2689.apps.googleusercontent.com',
  
  });

  React.useEffect(() => {
    (async () => {
      if (response?.type === 'success') {
        const idToken = response.params?.id_token;
        const cred = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, cred);
        console.log('Google sign-in successful!');
      }
    })().catch(e => console.warn(e));
  }, [response]);

  return (
    <Button
      title="התחברות עם Google"
      onPress={() => promptAsync()}
      disabled={!request}
    />
  );
}