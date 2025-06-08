import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TextInput, TouchableOpacity } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import googleAuthConfig from '../../assets/utils/authConfig'

WebBrowser.maybeCompleteAuthSession();

const SocialRegister = ({ route, navigation }) => {
  const provider = route?.params?.provider || 'Google';
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    ...googleAuthConfig,
    useProxy: true,
  });




  const [idToken, setIdToken] = useState(null);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  // ☝️ פותח את דיאלוג Google מיד עם טעינת העמוד
  useEffect(() => {
    if (provider === 'Google') {
      promptAsync();
    }
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.idToken;
      if (!token) {
        Alert.alert('שגיאה', 'לא התקבל טוקן');
        return;
      }
      setIdToken(token);
    }
  }, [response]);

  const submitProfile = async () => {
    if (!nickname || !gender || !age) {
      Alert.alert('שגיאה', 'נא למלא את כל השדות');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://lovegame.somee.com/api/Users/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          email: '',
          nickname,
          gender,
          age: parseInt(age),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        Alert.alert('שגיאה', error.Message || 'שגיאה בשרת');
        return;
      }

      const data = await res.json();
      navigation.navigate('Home', { userId: data.UserID });

    } catch (err) {
      Alert.alert('שגיאה', 'שגיאה בשליחה לשרת');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {!idToken ? (
        <>
          <Text style={styles.title}>מתחבר עם {provider}...</Text>
          <ActivityIndicator size="large" color="#DB4437" />
        </>
      ) : (
        <>
          <Text style={styles.title}>השלם את הפרופיל</Text>
          <TextInput placeholder="כינוי" value={nickname} onChangeText={setNickname} style={styles.input} />
          <TextInput placeholder="גיל" value={age} onChangeText={setAge} keyboardType="numeric" style={styles.input} />
          <View style={styles.genderContainer}>
            <TouchableOpacity onPress={() => setGender('זכר')} style={[styles.genderButton, gender === 'זכר' && styles.genderSelected]}>
              <Text>👦🏻 זכר</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGender('נקבה')} style={[styles.genderButton, gender === 'נקבה' && styles.genderSelected]}>
              <Text>👧🏻 נקבה</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={submitProfile} style={styles.submitButton} disabled={loading}>
            <Text style={styles.submitText}>{loading ? 'שולח...' : 'סיום רישום'}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '80%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  genderContainer: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  genderButton: { padding: 10, borderWidth: 1, borderRadius: 8, backgroundColor: '#f0f0f0' },
  genderSelected: { backgroundColor: '#4CAF50' },
  submitButton: { backgroundColor: '#e91e63', padding: 12, borderRadius: 25 },
  submitText: { color: 'white', fontWeight: 'bold' },
});

export default SocialRegister;
