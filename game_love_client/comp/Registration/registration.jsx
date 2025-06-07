// עדכון: שתי אנימציות נפרדות עבור שדות הרשמה וכפתורי רשת חברתית
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Animated,
  ScrollView
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';

const Registration = ({ navigation }) => {
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [errors, setErrors] = useState({});

  const detailsAnim = useRef(new Animated.Value(0)).current;
  const socialAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gender) {
      Animated.parallel([
        Animated.timing(detailsAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: false,
        }),
        Animated.timing(socialAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: false,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(detailsAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(socialAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        })
      ]).start();
    }
  }, [gender]);

  const animatedHeight = detailsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 325]
  });

  const animatedSocialTranslate = socialAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0]
  });

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    if (field === 'nickname' && !value.trim()) {
      newErrors.nickname = 'יש להזין כינוי';
    } else if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        newErrors.email = 'יש להזין אימייל';
      } else if (!emailRegex.test(value)) {
        newErrors.email = 'אימייל לא תקין';
      } else {
        delete newErrors.email;
      }
    } else if (field === 'password') {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
      if (!value) {
        newErrors.password = 'יש להזין סיסמה';
      } else if (!passwordRegex.test(value)) {
        newErrors.password = 'סיסמה צריכה להכיל לפחות 6 תווים, אות ומספר';
      } else {
        delete newErrors.password;
      }
      if (confirmPassword && value !== confirmPassword) {
        newErrors.confirmPassword = 'הסיסמאות לא תואמות';
      } else {
        delete newErrors.confirmPassword;
      }
    } else if (field === 'confirmPassword') {
      if (value !== password) {
        newErrors.confirmPassword = 'הסיסמאות לא תואמות';
      } else {
        delete newErrors.confirmPassword;
      }
    } else if (field === 'age' && (!value || isNaN(value))) {
      newErrors.age = 'יש להזין גיל חוקי';
    } else {
      delete newErrors[field];
    }
    setErrors(newErrors);
  };

  const registerUser = () => {
    alert('נרשמת בהצלחה!');
  };

  return (
    <ImageBackground
      source={require('../../assets/images/reg_page_bg.jpg')}
      style={styles.background}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>רישום</Text>

        <TextInput
          label="כינוי"
          mode="outlined"
          dense
          value={nickname}
          onChangeText={(text) => {
            setNickname(text);
            validateField('nickname', text);
          }}
          error={!!errors.nickname}
          style={styles.input}
        />
        {errors.nickname && <Text style={styles.errorText}>{errors.nickname}</Text>}

        <Text style={styles.label}>מין:</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            onPress={() => setGender('זכר')}
            style={[styles.genderButton, gender === 'זכר' && styles.genderButtonSelected]}
          >
            <Text style={styles.genderEmoji}>👦🏻</Text>
            <Text style={styles.genderText}>זכר</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setGender('נקבה')}
            style={[styles.genderButton, gender === 'נקבה' && styles.genderButtonSelected]}
          >
            <Text style={styles.genderEmoji}>👧🏻</Text>
            <Text style={styles.genderText}>נקבה</Text>
          </TouchableOpacity>
        </View>

        <Animated.View style={{ overflow: 'hidden', height: animatedHeight }}>
          <View style={styles.expandedBlock}>
            <TextInput label="אימייל" mode="outlined" dense keyboardType="email-address" value={email} onChangeText={(text) => { setEmail(text); validateField('email', text); }} error={!!errors.email} style={styles.input} />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            <TextInput label="סיסמה" mode="outlined" dense secureTextEntry value={password} onChangeText={(text) => { setPassword(text); validateField('password', text); }} error={!!errors.password} style={styles.input} />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            <TextInput label="חזור על הסיסמה" mode="outlined" dense secureTextEntry value={confirmPassword} onChangeText={(text) => { setConfirmPassword(text); validateField('confirmPassword', text); }} error={!!errors.confirmPassword} style={styles.input} />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            <TextInput label="גיל" mode="outlined" dense keyboardType="numeric" value={age} onChangeText={(text) => { setAge(text); validateField('age', text); }} error={!!errors.age} style={styles.input} />
            {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            <Button mode="contained" icon="heart" onPress={registerUser} buttonColor="#e91e63" textColor="white" style={styles.heartButton}> הירשם </Button>
          </View>
        </Animated.View>

        <Animated.View style={{ transform: [{ translateY: animatedSocialTranslate }] }}>
          <Button mode="outlined" icon="google" textColor="#DB4437" onPress={() => navigation.navigate('SocialRegister', { provider: 'Google' })} style={styles.socialButton}> הירשם עם Google </Button>
          <Button mode="outlined" icon="facebook" textColor="#1877F2" onPress={() => navigation.navigate('SocialRegister', { provider: 'Facebook' })} style={styles.socialButton}> הירשם עם Facebook </Button>
        </Animated.View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>כבר יש לך חשבון? התחבר כאן</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover' },
  scrollContainer: { padding: 20, alignItems: 'center' },
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
  socialButton: { marginTop: 10, width: 300, borderRadius: 25, borderWidth: 1 },
  linkText: { color: '#fff', textAlign: 'center', fontSize: 16, marginTop: 20, textDecorationLine: 'underline' },
  expandedBlock: { alignItems: 'center' },
});

export default Registration;
