// comp/game/GameHome.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ROW_W = Math.min(520, Math.max(320, Math.round(Dimensions.get('window').width - 40)));

export default function GameHome({ navigation, route }) {
  // קבלת userId מפרמס, ואם חסר – טעינה מ-SecureStore
  const [userId, setUserId] = useState(route?.params?.userId ?? null);

  // 0 = כבוי. 1-3 = רמת קושי
  const [introLevel,   setIntroLevel]   = useState(0); // היכרות (❤️)
  const [funLevel,     setFunLevel]     = useState(0); // כיף (❤️❤️)
  const [passionLevel, setPassionLevel] = useState(0); // תשוקה (❤️❤️❤️)

  useEffect(() => {
    (async () => {
      if (!userId) {
        const saved = await SecureStore.getItemAsync('lg_userId');
        if (saved) setUserId(saved);
      }
    })();
  }, [userId]);

  const Stars = ({ value, onChange }) => (
    <View style={styles.starsRow}>
      {[1, 2, 3].map((i) => (
        <TouchableOpacity key={i} onPress={() => onChange(i)}>
          <Text style={styles.star}>{i <= value ? '★' : '☆'}</Text>
        </TouchableOpacity>
      ))}
      {/* איפוס (אופציונלי): מאפשר לכבות קטגוריה */}
      {value > 0 && (
        <TouchableOpacity onPress={() => onChange(0)}>
          <Text style={styles.clearText}>נקה</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const goNext = () => {
    if (!userId) {
      Alert.alert('שגיאה', 'לא נמצא מזהה משתמש (userId). נסה להתחבר מחדש.');
      return;
    }
    if (introLevel === 0 && funLevel === 0 && passionLevel === 0) {
      Alert.alert('בחירה נדרשת', 'בחר לפחות קטגוריה אחת ורמת קושי (כוכבים 1–3).');
      return;
    }

    // העברת הבחירות למשחק
    navigation.navigate('IndexGame', {
      userId,
      selection: {
        intro:   introLevel,   // 0=כבוי, 1-3 רמה
        fun:     funLevel,
        passion: passionLevel,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>בחירת סגנון משחק</Text>
      <Text style={styles.caption}>
        לכל קטגוריה בחרו רמת קושי בכוכבים (1–3). רק קטגוריות עם כוכבים ייכנסו למשחק.
      </Text>

      {/* היכרות — לב אחד */}
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.hearts}>❤️</Text>
          <Text style={styles.label}>היכרות</Text>
        </View>
        <Stars value={introLevel} onChange={setIntroLevel} />
      </View>

      {/* כיף — שני לבבות */}
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.hearts}>❤️❤️</Text>
          <Text style={styles.label}>כיף</Text>
        </View>
        <Stars value={funLevel} onChange={setFunLevel} />
      </View>

      {/* תשוקה — שלושה לבבות */}
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.hearts}>❤️❤️❤️</Text>
          <Text style={styles.label}>תשוקה</Text>
        </View>
        <Stars value={passionLevel} onChange={setPassionLevel} />
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={goNext}>
        <Text style={styles.primaryText}>המשך למשחק</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: '#f7f7fb',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  caption: { fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' },

  row: {
    width: ROW_W,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e7e7ee',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hearts: { fontSize: 18 },
  label: { fontSize: 16, fontWeight: '600' },

  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  star: { fontSize: 26, lineHeight: 28 },
  clearText: { marginStart: 8, color: '#888', fontSize: 14 },

  primaryBtn: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: ROW_W,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
