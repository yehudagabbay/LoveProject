import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function CustomAlert({
  visible,
  type = 'info',      // success | error | warning | info
  title,
  message,
  duration = 1500,
  onClose,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  // 🎨 צבעים תואמים לעיצוב שלך
  const COLORS = {
    success: {
      bg: '#E8F5E9',        // ירוק בהיר נעים
      border: '#4CAF50',    // ירוק כהה
      text: '#1B5E20',
    },
    info: {
      bg: '#E3F2FD',        // כחול בהיר
      border: '#2196F3',
      text: '#0D47A1',
    },
    warning: {
      bg: '#FFF8E1',        // צהוב בהיר
      border: '#FFB300',
      text: '#E65100',
    },
    error: {
      bg: '#FFEBEE',        // אדום בהיר
      border: '#E53935',
      text: '#B71C1C',
    },
  };

  const palette = COLORS[type] || COLORS.info;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start(() => onClose && onClose());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrapper,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View
        style={[
          styles.alert,
          {
            backgroundColor: palette.bg,
            borderLeftColor: palette.border,
          },
        ]}
      >
        {title ? (
          <Text style={[styles.title, { color: palette.text }]}>
            {title}
          </Text>
        ) : null}

        <Text style={[styles.message, { color: palette.text }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 35,
    left: 0,
    right: 0,
    zIndex: 5000,
    elevation: 5000,
    alignItems: 'center',
  },
  alert: {
    minWidth: '80%',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'right',
  },
  message: {
    fontSize: 13,
    textAlign: 'right',
  },
});
