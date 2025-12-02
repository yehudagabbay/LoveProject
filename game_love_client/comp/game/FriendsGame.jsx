// comp/game/FriendsGame.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';

const W = Math.min(520, Math.max(320, Math.round(Dimensions.get('window').width - 40)));

export default function FriendsGame({ navigation }) {
  const handleCategorySelect = (category) => {
    navigation.navigate('IndexGame', { gameMode: 'friends', category });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>משחק חברים / עבודה</Text>
      <Text style={styles.subtitle}>בחרו סגנון המתאים לקבוצה</Text>

      <ScrollView style={{ width: W }} showsVerticalScrollIndicator={false}>

        <TouchableOpacity
          style={[styles.box, styles.color1]}
          onPress={() => handleCategorySelect('היכרות')}
        >
          <Text style={styles.boxTitle}>👥 היכרות</Text>
          <Text style={styles.boxDesc}>שאלות לשבירת קרח והכירות הדדית</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.box, styles.color2]}
          onPress={() => handleCategorySelect('גיבוש צוות')}
        >
          <Text style={styles.boxTitle}>🤝 גיבוש צוות</Text>
          <Text style={styles.boxDesc}>משימות מחזקות וחווייתיות</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.box, styles.color3]}
          onPress={() => handleCategorySelect('משימות מצחיקות')}
        >
          <Text style={styles.boxTitle}>😂 משימות מצחיקות</Text>
          <Text style={styles.boxDesc}>משחקים ליצירת חיוכים וצחוקים</Text>
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
  color1: { backgroundColor: '#009688' },
  color2: { backgroundColor: '#3949ab' },
  color3: { backgroundColor: '#d81b60' },
});
