import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { TextInput, RadioButton, Button } from 'react-native-paper';

const Registration = ({ navigation }) => {
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');

  const validateForm = () => {

    // if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    //   alert('כתובת האימייל אינה תקינה!');
    //   return false;
    // }
    // if (password !== confirmPassword) {
    //   alert('סיסמאות לא תואמות!');
    //   return;
    // }

    return registerUser();
  }

  const registerUser = async () => {
    if (password !== confirmPassword) {
      alert('סיסמאות לא תואמות!');
      return;
    }

    const userData = {
      nickname: nickname,
      gender: gender,
      email: email,
      passwordHash: password,
      age: parseInt(age)
    };

    console.log('שולח בקשה לשרת...', JSON.stringify(userData));
    try {
      const response = await fetch('http://loveGame.somee.com/api/Users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      console.log('סטטוס תגובה:', response.status);
      console.log('תוכן תגובה:', await response.text());
      if (!response.ok) {
        throw new Error(`שגיאה: ${response.status}`);
      }
      const data = await response.json();
      alert('הרישום הצליח!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('שגיאה מלאה:', error.message);
      alert(`שגיאה ברישום: ${error.message}`);
    }
  };





  return (
    <ImageBackground
      source={require('../../assets/images/reg_page_bg.jpg')} // שים כאן את תמונת הרקע שלך
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>רישום</Text>

        <TextInput
          label="כינוי" mode="outlined" dense value={nickname} onChangeText={setNickname} style={styles.input}
        />

        <Text style={styles.label}>מין:</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[styles.radioButton, gender === 'זכר' && styles.selectedRadio]} onPress={() => setGender('זכר')}
          >
            <Text style={styles.radioText}>זכר</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.radioButton, gender === 'נקבה' && styles.selectedRadioRed]} onPress={() => setGender('נקבה')}
          >
            <Text style={styles.radioText}>נקבה</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          label="אימייל"
          mode="outlined"
          dense
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          label="סיסמה"
          mode="outlined"
          dense
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TextInput
          label="חזור על הסיסמה"
          mode="outlined"
          dense
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
        />

        <TextInput
          label="גיל"
          mode="outlined"
          dense
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
          style={styles.input}
        />

        {/* 🔹 כפתור בעיצוב MUI */}
        <Button
          mode="text" // עיצוב כמו MUI - טקסט בלבד
          onPress={validateForm}
          textColor="#007BFF" // צבע כחול כמו ב-MUI
        >
          הירשם
        </Button>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>כבר יש לך חשבון? התחבר כאן</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

// **עיצוב הכפתור והתיבה**
const styles = StyleSheet.create({
  background: {
    flex: 1, // וודא שהתמונה ממלאת את כל המסך
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  container: {
    flex: 1, // וודא שהקונטיינר ממלא את המסך
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff', // הטקסט יהיה לבן כדי שייראה טוב על הרקע
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // מעט שקוף כדי להשתלב עם הרקע
    borderRadius: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff', // לבן כדי להתאים לרקע
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 25,
    marginHorizontal: 5,
  },
  selectedRadio: {
    backgroundColor: 'blue',
    borderColor: 'blue',
  },
  selectedRadioRed: {
    backgroundColor: 'red',
    borderColor: 'red',
  },
  radioText: {
    fontSize: 16,
    color: '#fff',
  },
  linkText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});

export default Registration;
