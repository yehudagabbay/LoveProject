// comp/Login/Login.jsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';

// ✅ לוגו מונפש
import AnimatedLogo from '../Settings/AnimatedLogo';

// ✅ אותה התראה מעוצבת כמו בעמוד הרישום
// (אותו נתיב כמו ב-Registration.jsx)
import CustomAlert from '../../assets/utils/CustomAlert';

const API_BASE = 'http://lovegame.somee.com/api';
const { width } = Dimensions.get('window');

export default function Login({ route, navigation }) {
  const prefilledEmail = route?.params?.email || '';
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- התראה מעוצבת (כמו ברישום) ---
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'success', // 'success' | 'error'
    title: '',
    message: '',
    onOk: null,
  });

  const showAlert = (type, title, message, onOk = null) => {
    setAlertConfig({
      visible: true,
      type,
      title,
      message,
      onOk,
    });
  };

  const handleAlertClose = () => {
    const callback = alertConfig.onOk;
    setAlertConfig(prev => ({ ...prev, visible: false }));
    if (callback) callback();
  };

  // --- התחברות ---
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showAlert('error', 'שגיאה', 'יש למלא אימייל וסיסמה.');
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

      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {}

      if (res.ok) {
        const user = data?.User || data?.user || {};
        const userId = String(user.UserID ?? user.userID ?? user.id ?? '');

        if (!userId) {
          showAlert('error', 'שגיאה', 'לא התקבל מזהה משתמש מהשרת.');
          return;
        }

        await SecureStore.setItemAsync('lg_userId', userId);
        await SecureStore.setItemAsync('lg_user', JSON.stringify(user));

        // ✅ התראת הצלחה מעוצבת + ניווט אחרי אישור
        showAlert(
          'success',
          'התחברת בהצלחה!',
          'מיד עוברים לבחירת סגנון המשחק...',
          () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'GameModeSelect', params: { userId, user } }],
            });
          }
        );

        return;
      }

      const msg =
        data?.message ||
        data?.error ||
        raw ||
        `שגיאה בהתחברות (HTTP ${res.status})`;

      showAlert('error', 'שגיאה', msg);
    } catch (err) {
      showAlert('error', 'תקלה ברשת', err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/login_bg1.png')}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* ✅ התראה מעוצבת – בדיוק כמו ברישום */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={handleAlertClose}
      />

      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <AnimatedLogo style={styles.logo} />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>ברוכים השבים ❤️</Text>
            <Text style={styles.subtitle}>התחברו כדי להמשיך במשחק</Text>

            <TextInput
              label="אימייל"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              mode="outlined"
              style={styles.input}
              outlineColor="transparent"
              activeOutlineColor="#E91E63"
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="email-outline" color="#888" />}
            />

            <TextInput
              label="סיסמה"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              mode="outlined"
              style={styles.input}
              outlineColor="transparent"
              activeOutlineColor="#E91E63"
              theme={{ roundness: 12 }}
              left={<TextInput.Icon icon="lock-outline" color="#888" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  color="#888"
                  onPress={() => setShowPassword(prev => !prev)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={busy}
              disabled={busy}
              style={styles.loginBtn}
              labelStyle={styles.loginBtnText}
              contentStyle={{ height: 50 }}
            >
              התחברות
            </Button>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>עדיין אין לכם משתמש?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Registration')}
            >
              <Text style={styles.registerLink}>הירשמו עכשיו</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 10, 30, 0.4)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 180,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  loginBtn: {
    marginTop: 8,
    borderRadius: 50,
    backgroundColor: '#E91E63',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 15,
    marginRight: 6,
  },
  registerLink: {
    color: '#FF80AB',
    fontSize: 15,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
