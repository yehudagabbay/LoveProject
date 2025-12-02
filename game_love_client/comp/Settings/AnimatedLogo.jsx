// מיקום הקובץ: תלוי איפה שמרת, כנראה comp/Settings/AnimatedLogo.jsx לפי הקוד שלך
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

// ודא שהתמונה אכן נמצאת בתיקייה הזו
const logoSource = require('../../assets/images/logo1.png');

const AnimatedLogo = ({ style }) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    spinValue.setValue(0);

    // שלב 1: כניסה מהירה
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      spinValue.setValue(0);
      // שלב 2: לולאה אינסופית איטית
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    });
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Image
      source={logoSource}
      resizeMode="contain"
      style={[style, { transform: [{ rotate: spin }] }]}
    />
  );
};

export default AnimatedLogo;