import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Animated,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';

// --- כאן אנחנו מייבאים את ההתראה המעוצבת ---
import CustomAlert from '../../assets/utils/CustomAlert';

const API_BASE = 'http://loveGame.somee.com/api';

const Registration = ({ navigation }) => {
  // שדות הטופס
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');

  // סטייט לשגיאות + טעינה
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // --- סטייט לניהול ההתראה המעוצבת ---
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'success', // 'success' או 'error'
    title: '',
    message: '',
    onOk: null // פונקציה שתרוץ כשלוחצים אישור (למשל ניווט)
  });

  // רפרנס לגלילה
  const scrollViewRef = useRef();

  // אנימציות
  const detailsAnim = useRef(new Animated.Value(0)).current;
  const socialAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gender) {
      Animated.parallel([
        Animated.timing(detailsAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(socialAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
      ]).start(() => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });
    } else {
      Animated.parallel([
        Animated.timing(detailsAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
        Animated.timing(socialAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
      ]).start();
    }
  }, [gender]);

  const animatedHeight = detailsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 400] });
  const animatedSocialTranslate = socialAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0] });

  // --- פונקציות עזר להתראה ---
  const showAlert = (type, title, message, onOk = null) => {
    setAlertConfig({ visible: true, type, title, message, onOk });
  };

  // בתוך Registration.jsx

  const handleAlertClose = () => {
    const callback = alertConfig.onOk;

    // קודם מאפסים את ה-visible כדי שהרכיב יפסיק להיות מרונדר
    setAlertConfig(prev => ({ ...prev, visible: false }));

    // אם הוגדרה פעולה (כמו ניווט), מפעילים אותה עכשיו
    if (callback) callback();
  };

  const validate = (field, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    const model = { nickname, gender, email, password, confirmPassword, age, ...(field ? { [field]: value } : {}) };

    const buildErrors = (m) => {
      const e = {};
      if (!m.nickname?.trim()) e.nickname = 'יש להזין כינוי';
      if (!m.gender) e.gender = 'יש לבחור מין';
      if (!m.email?.trim()) e.email = 'יש להזין אימייל';
      else if (!emailRegex.test(m.email)) e.email = 'אימייל לא תקין';
      if (!m.password) e.password = 'יש להזין סיסמה';
      else if (!passwordRegex.test(m.password)) e.password = 'סיסמה צריכה להכיל לפחות 6 תווים, אות ומספר';
      if (m.confirmPassword !== m.password) e.confirmPassword = 'הסיסמאות לא תואמות';
      const n = Number(m.age);
      if (!m.age || Number.isNaN(n) || n <= 0) e.age = 'יש להזין גיל חוקי';
      return e;
    };

    if (field) {
      setErrors(buildErrors(model));
      return;
    }
    const allErrors = buildErrors(model);
    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const registerUser = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const payload = {
        nickname: nickname.trim(),
        gender,
        email: email.trim(),
        passwordHash: password,
        age: Number(age),
      };

      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let raw = '';
      let data = null;
      try {
        raw = await res.text();
        data = raw ? JSON.parse(raw) : null;
      } catch { }

      if (res.ok) {
        // --- הצלחה: הצגת מודל ירוק וניווט בלחיצה על אישור ---
        showAlert(
          'success',
          'הצלחה',
          data?.message || 'נרשמת בהצלחה!',
          () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login', params: { email: email.trim() } }],
            });
          }
        );
        return;
      }

      const errMsg = data?.message || data?.error || raw || `שגיאה ברישום (HTTP ${res.status})`;
      // --- שגיאה: הצגת מודל אדום ---
      showAlert('error', 'שגיאה', errMsg);

    } catch (err) {
      showAlert('error', 'תקלה ברשת', err?.message || String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/reg_page_bg.jpg')}
      style={styles.background}
    >
      {/* הרכיב של ההתראה מוטמע כאן למעלה */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={handleAlertClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>רישום</Text>

          <TextInput
            label="כינוי"
            mode="outlined"
            dense
            value={nickname}
            onChangeText={(text) => { setNickname(text); validate('nickname', text); }}
            error={!!errors.nickname}
            style={styles.input}
          />
          {errors.nickname && <Text style={styles.errorText}>{errors.nickname}</Text>}

          <Text style={styles.label}>מין:</Text>
          {errors.gender ? <Text style={[styles.errorText, { alignSelf: 'flex-start' }]}>{errors.gender}</Text> : null}
          <View style={styles.genderContainer}>
            <TouchableOpacity
              onPress={() => { setGender('זכר'); validate('gender', 'זכר'); }}
              style={[styles.genderButton, gender === 'זכר' && styles.genderButtonSelected]}
            >
              <Text style={styles.genderEmoji}>👦🏻</Text>
              <Text style={styles.genderText}>זכר</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setGender('נקבה'); validate('gender', 'נקבה'); }}
              style={[styles.genderButton, gender === 'נקבה' && styles.genderButtonSelected]}
            >
              <Text style={styles.genderEmoji}>👧🏻</Text>
              <Text style={styles.genderText}>נקבה</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={{ overflow: 'hidden', height: animatedHeight }}>
            <View style={styles.expandedBlock}>
              <TextInput
                label="אימייל"
                mode="outlined"
                dense
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => { setEmail(text); validate('email', text); }}
                error={!!errors.email}
                style={styles.input}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              <TextInput
                label="סיסמה"
                mode="outlined"
                dense
                secureTextEntry
                value={password}
                onChangeText={(text) => { setPassword(text); validate('password', text); }}
                error={!!errors.password}
                style={styles.input}
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              <TextInput
                label="חזור על הסיסמה"
                mode="outlined"
                dense
                secureTextEntry
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); validate('confirmPassword', text); }}
                error={!!errors.confirmPassword}
                style={styles.input}
              />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

              <TextInput
                label="גיל"
                mode="outlined"
                dense
                keyboardType="numeric"
                value={age}
                onChangeText={(text) => { setAge(text); validate('age', text); }}
                error={!!errors.age}
                style={styles.input}
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

              <Button
                mode="contained"
                icon="heart"
                onPress={registerUser}
                disabled={busy}
                buttonColor="#e91e63"
                textColor="white"
                style={[styles.heartButton, { width: 300 }]}
              >
                {busy ? 'שולח...' : ' הירשם '}
              </Button>

              {busy ? <View style={{ marginTop: 10 }}><ActivityIndicator /></View> : null}
            </View>
          </Animated.View>

          <Animated.View style={{ transform: [{ translateY: animatedSocialTranslate }], width: '100%', alignItems: 'center', marginTop: 10 }}>
            <Button
              mode="outlined"
              icon="google"
              textColor="#DB4437"
              onPress={() => navigation.navigate('SocialRegister', { provider: 'Google' })}
              style={styles.socialButton}
            >
              הירשם עם Google
            </Button>
            <Button
              mode="outlined"
              icon="facebook"
              textColor="#1877F2"
              onPress={() => navigation.navigate('SocialRegister', { provider: 'Facebook' })}
              style={styles.socialButton}
            >
              הירשם עם Facebook
            </Button>
          </Animated.View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>כבר יש לך חשבון? התחבר כאן</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  scrollContainer: { padding: 20, alignItems: 'center', paddingBottom: 100 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  input: { width: 300, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 8, marginBottom: 10 },
  errorText: { color: 'red', fontSize: 12, marginBottom: 5, alignSelf: 'flex-start' },
  label: { fontSize: 18, fontWeight: 'bold', color: '#fff', alignSelf: 'flex-start', marginBottom: 5 },
  genderContainer: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  genderButton: { alignItems: 'center', padding: 10, borderWidth: 2, borderColor: '#ccc', borderRadius: 12, width: 100, backgroundColor: '#ffffff66' },
  genderButtonSelected: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  genderEmoji: { fontSize: 30 },
  genderText: { fontSize: 16, color: '#fff', fontWeight: 'bold', marginTop: 5 },
  heartButton: { marginTop: 20, borderRadius: 30, paddingVertical: 5, elevation: 3 },
  socialButton: { marginTop: 10, width: 300, borderRadius: 25, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.8)' },
  linkText: { color: '#fff', textAlign: 'center', fontSize: 16, marginTop: 20, textDecorationLine: 'underline' },
  expandedBlock: { alignItems: 'center' },
});

export default Registration;