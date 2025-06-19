// SocialRegister.jsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Dimensions } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const screenWidth = Dimensions.get('window').width;

const SocialRegister = ({ navigation }) => {
  const webClientId = '302885477032-n51csr8l7jtvnt0gf4jugju58nee2689.apps.googleusercontent.com'; 

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: webClientId,
      offlineAccess: false,
    });
  }, []);

  const googleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('User Info:', userInfo);
      Alert.alert("התחברת בהצלחה", userInfo.user.email);

    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("בוטל על ידי המשתמש");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("תהליך התחברות כבר מתבצע");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("אין שירותי Google זמינים");
      } else {
        Alert.alert("שגיאה לא מזוהה", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>רישום עם רשת חברתית</Text>
      
      <Pressable onPress={googleLogin}>
        <View style={styles.loginButton}>
          <Text style={styles.buttonText}>התחבר עם Google</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  loginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: screenWidth - 50,
    height: 48,
    borderRadius: 10,
    borderColor: '#DB4437',
    borderWidth: 1,
  },
  buttonText: {
    color: '#DB4437',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default SocialRegister;
