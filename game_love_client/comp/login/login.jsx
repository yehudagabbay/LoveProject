// comp/Login/Login.jsx
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://lovegame.somee.com/api';

export default function Login({ route, navigation }) {
  const prefilledEmail = route?.params?.email || '';
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('שגיאה', 'יש למלא אימייל וסיסמה.');
      return;
    }

    setBusy(true);

    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const raw = await res.text();
      let data = null;

      try { data = raw ? JSON.parse(raw) : null; } catch {}

      if (res.ok) {
        const user = data?.User || data?.user || {};
        const userId = String(user.UserID ?? user.userID ?? user.id ?? '');

        if (!userId) {
          Alert.alert('שגיאה', 'לא התקבל מזהה משתמש מהשרת.');
          return;
        }

        // 🟦 שמירת מזהה משתמש (משמש לפתיחה אוטומטית)
        await SecureStore.setItemAsync('lg_userId', userId);

        // 🟦 שמירת המשתמש המלא (אם תרצה להשתמש בו בהמשך)
        await SecureStore.setItemAsync('lg_user', JSON.stringify(user));

        // 🟩 מעבר למסך בחירת מצב המשחק – עם userId
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'GameModeSelect',
              params: { userId, user },
            },
          ],
        });

        return;
      }

      Alert.alert(
        'שגיאה',
        data?.message || data?.error || raw || `שגיאה בהתחברות (HTTP ${res.status})`
      );

    } catch (err) {
      Alert.alert('תקלה ברשת', err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
        mode="text"
        compact
        onPress={() => navigation.navigate('Registration')}
        style={styles.backBtn}
        icon="arrow-right"
      >
        חזרה לרישום
      </Button>

      <Text style={styles.title}>התחברות</Text>

      <TextInput
        label="אימייל"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        label="סיסמה"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button mode="contained" onPress={handleLogin} disabled={busy}>
        {busy ? 'מתחבר...' : 'התחבר'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 60, left: 16, zIndex: 10 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 12 },
});
