// comp/Welcome/WelcomeScreen.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const W = Math.min(520, Math.max(320, Math.round(Dimensions.get('window').width - 40)));

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Love Game</Text>
      <Text style={styles.subtitle}>בחר איך להמשיך</Text>

      <View style={styles.cardsRow}>
        {/* משתמש רשום */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.cardIcon}>👤</Text>
          <Text style={styles.cardTitle}>אני משתמש רשום</Text>
          <Text style={styles.cardText}>
            כניסה עם משתמש קיים
          </Text>
        </TouchableOpacity>

        {/* משתמש חדש */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Registration')}
        >
          <Text style={styles.cardIcon}>✨</Text>
          <Text style={styles.cardTitle}>אני משתמש חדש</Text>
          <Text style={styles.cardText}>
            יצירת משתמש חדש ורישום
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.helper}>
        אם כבר התחברת בעבר ולא התנתקת, תיכנס אוטומטית לבחירת סגנון משחק.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1020',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#cfd8dc',
    marginBottom: 32,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: W,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 18,
    backgroundColor: '#1c2540',
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 13,
    color: '#b0bec5',
    textAlign: 'center',
  },
  helper: {
    fontSize: 12,
    color: '#90a4ae',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
