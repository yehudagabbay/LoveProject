// comp/Welcome/GameModeSelect.jsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const W = Math.min(520, Math.max(320, Math.round(Dimensions.get('window').width - 40)));

export default function GameModeSelect({ navigation }) {
  
  const handleChooseMode = (mode) => {

    if (mode === 'couple') {
      navigation.navigate('GameHome', { gameMode: 'couple' });
      return;
    }

    if (mode === 'family') {
      navigation.navigate('FamilyGame', { gameMode: 'family' });
      return;
    }

    if (mode === 'friends') {
      navigation.navigate('FriendsGame', { gameMode: 'friends' });
      return;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>בחר סגנון משחק</Text>
      <Text style={styles.subtitle}>אפשר לשנות בכל פעם מחדש</Text>

      <View style={styles.buttonsWrapper}>

        {/* זוגי */}
        <TouchableOpacity
          style={[styles.modeButton, styles.couple]}
          onPress={() => handleChooseMode('couple')}
        >
          <Text style={styles.modeTitle}>💑 זוגי</Text>
          <Text style={styles.modeDesc}>שאלות ומשימות לזוגות</Text>
        </TouchableOpacity>

        {/* משפחה */}
        <TouchableOpacity
          style={[styles.modeButton, styles.family]}
          onPress={() => handleChooseMode('family')}
        >
          <Text style={styles.modeTitle}>👨‍👩‍👧‍👦 משפחה</Text>
          <Text style={styles.modeDesc}>היכרות וכיף לכל המשפחה</Text>
        </TouchableOpacity>

        {/* חברים */} 
        <TouchableOpacity
          style={[styles.modeButton, styles.friends]}
          onPress={() => handleChooseMode('friends')}
        >
          <Text style={styles.modeTitle}>👥 חברים / עבודה</Text>
          <Text style={styles.modeDesc}>שאלות ומשימות לגיבוש</Text>
        </TouchableOpacity>

      </View>
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
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#cfd8dc',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonsWrapper: {
    width: W,
  },
  modeButton: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  modeTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 4,
  },
  modeDesc: {
    fontSize: 13,
    color: '#eceff1',
  },
  couple: { backgroundColor: '#e91e63' },
  family: { backgroundColor: '#43a047' },
  friends: { backgroundColor: '#1e88e5' },
});
