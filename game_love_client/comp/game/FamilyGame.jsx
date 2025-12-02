// comp/game/FamilyGame.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';

const W = Math.min(520, Math.max(320, Math.round(Dimensions.get('window').width - 40)));

export default function FamilyGame({ navigation }) {
  const handleCategorySelect = (category) => {
    // later → navigate to family cards page
    navigation.navigate('IndexGame', { gameMode: 'family', category });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>משחק משפחתי</Text>
      <Text style={styles.subtitle}>בחרו תחום שהמשפחה רוצה לשחק בו</Text>

      <ScrollView style={{ width: W }} showsVerticalScrollIndicator={false}>

        <TouchableOpacity
          style={[styles.box, styles.color1]}
          onPress={() => handleCategorySelect('היכרות משפחתית')}
        >
          <Text style={styles.boxTitle}>👨‍👩‍👧‍👦 היכרות משפחתית</Text>
          <Text style={styles.boxDesc}>שאלות שמחברות בין כולם</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.box, styles.color2]}
          onPress={() => handleCategorySelect('כיף משפחתי')}
        >
          <Text style={styles.boxTitle}>🎲 כיף משפחתי</Text>
          <Text style={styles.boxDesc}>משימות מהנות ושוברות שגרה</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.box, styles.color3]}
          onPress={() => handleCategorySelect('ערכים ומשמעות')}
        >
          <Text style={styles.boxTitle}>💬 ערכים ומשמעות</Text>
          <Text style={styles.boxDesc}>שאלות לפיתוח שיח משפחתי</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1020',
    paddingTop: 50,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitle: {
    color: '#bbb',
    fontSize: 15,
    marginBottom: 20,
  },
  box: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 14,
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  boxDesc: {
    color: '#e0e0e0',
    fontSize: 13,
  },
  color1: { backgroundColor: '#1e88e5' },
  color2: { backgroundColor: '#8e24aa' },
  color3: { backgroundColor: '#43a047' },
});
