// comp/CustomAlert.jsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView, Platform, Dimensions } from 'react-native';

const CustomAlert = ({ visible, type, title, message, onClose }) => {
  // אנימציה למיקום (Y) - מתחיל למעלה מחוץ למסך
  const translateY = useRef(new Animated.Value(-150)).current;

  useEffect(() => {
    if (visible) {
      // 1. כניסה: החלקה למטה
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 5,
      }).start();

      // 2. יציאה: אחרי 2 שניות החלקה למעלה
      const timer = setTimeout(() => {
        closeAlert();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const closeAlert = () => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onClose) onClose(); // קריאה לפונקציה שמאפסת את הסטייט באבא
    });
  };

  if (!visible) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? '#4CAF50' : '#F44336'; // ירוק או אדום
  const iconSymbol = isSuccess ? '✓' : '!';

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <SafeAreaView style={{ backgroundColor: bgColor, width: '100%' }}>
        <View style={[styles.content, { backgroundColor: bgColor }]}>
          
          {/* אייקון צדדי */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>{iconSymbol}</Text>
          </View>

          {/* טקסט ההודעה */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999, // שיהיה תמיד מעל הכל
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 15, // התאמה למגרעת/סטטוס בר
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    marginLeft: 10
  },
  iconText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'left', // או right לעברית מלאה
  },
  message: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'left',
  },
});

export default CustomAlert;