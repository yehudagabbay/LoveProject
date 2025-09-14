// comp/game/GameHome.jsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { LogoutButton } from '../Settings/Settings';

// ───────────────────────────────────────────────────────────────────────────────
// בסיסי ה-API: קודם HTTP (מה שעובד ב-Postman), אחר כך HTTPS כ-fallback
// חשוב: ודא שב-app.json יש "android": { "usesCleartextTraffic": true }
const API_BASES = [
  'http://lovegame.somee.com/api',
  'https://lovegame.somee.com/api',
];

// מזהי קטגוריות לפי המסד שלך
const CATEGORY_IDS = { intro: 1, fun: 2, passion: 3 };
// כמה קלפים לכל קטגוריה
const DEFAULT_COUNT_PER_CAT = 5;

// גודל רכיבים
const ROW_W = Math.min(520, Math.max(320, Math.round(Dimensions.get('window').width - 40)));

// ───────────────────────────────────────────────────────────────────────────────
// בקשת הקלפים: מנסה גם Users/ וגם users/ וגם בסיסים שונים; כולל timeout + לוגים
async function fetchSelectedCards(selections) {
  const paths = ['Users/get-selected-cards', 'users/get-selected-cards'];
  let lastErr;

  for (const base of API_BASES) {
    for (const path of paths) {
      const url = `${base}/${path}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

      try {
        console.log('→ POST', url, selections);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ Selections: selections }),
          signal: controller.signal,
        });

        const raw = await res.text();
        clearTimeout(timeoutId);

        let data = null;
        try { data = raw ? JSON.parse(raw) : null; } catch { /* לא JSON */ }

        if (res.ok) {
          console.log('✓ response 200', Array.isArray(data) ? `cards=${data.length}` : data);
          return data;
        }

        // המשך לנסות וריאנטים אם 404; אחרת זרוק שגיאה עם פרטים גולמיים
        if (res.status === 404) {
          console.log('↪ 404, trying next variant', url);
          continue;
        }

        console.log('✖ response', res.status, raw);
        throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
      } catch (e) {
        clearTimeout(timeoutId);
        lastErr = e;
        console.log('✖ fetch error', url, String(e));
        // ננסה בסיס/נתיב אחר בלולאה
      }
    }
  }

  throw lastErr || new Error('Network/API unreachable');
}

// ───────────────────────────────────────────────────────────────────────────────

export default function GameHome({ navigation, route }) {
  const [userId, setUserId] = useState(route?.params?.userId ?? null);

  // דרגות קושי (0 = לא נבחר)
  const [introLevel, setIntroLevel] = useState(0);   // היכרות
  const [funLevel, setFunLevel] = useState(0);       // כיף/קירוב
  const [passionLevel, setPassionLevel] = useState(0); // תשוקה

  const [busy, setBusy] = useState(false);

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
      {value > 0 && (
        <TouchableOpacity onPress={() => onChange(0)}>
          <Text style={styles.clearText}>נקה</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const Row = ({ title, hearts, value, onChange }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.hearts}>{hearts}</Text>
        <Text style={styles.label}>{title}</Text>
      </View>
      <Stars value={value} onChange={onChange} />
    </View>
  );

  const buildSelections = () => {
    const arr = [];
    if (introLevel > 0)   arr.push({ CategoryID: CATEGORY_IDS.intro,   LevelID: introLevel,   NumberOfCards: DEFAULT_COUNT_PER_CAT });
    if (funLevel > 0)     arr.push({ CategoryID: CATEGORY_IDS.fun,     LevelID: funLevel,     NumberOfCards: DEFAULT_COUNT_PER_CAT });
    if (passionLevel > 0) arr.push({ CategoryID: CATEGORY_IDS.passion, LevelID: passionLevel, NumberOfCards: DEFAULT_COUNT_PER_CAT });
    return arr;
  };

  const goNext = async () => {
    if (!userId) {
      Alert.alert('שגיאה', 'לא נמצא מזהה משתמש (userId). התחבר/י מחדש.');
      return;
    }

    const selections = buildSelections();
    if (selections.length === 0) {
      Alert.alert('בחירה נדרשת', 'בחר/י לפחות קטגוריה אחת ורמת קושי (כוכבים 1–3).');
      return;
    }

    setBusy(true);
    try {
      const cards = await fetchSelectedCards(selections);
      if (!Array.isArray(cards) || cards.length === 0) {
        Alert.alert('אין קלפים', 'לא נמצאו קלפים עבור הבחירות שלך.');
        return;
      }

      navigation.navigate('IndexGame', {
        userId,
        selection: { intro: introLevel, fun: funLevel, passion: passionLevel },
        cards,
      });
    } catch (e) {
      Alert.alert('שגיאה בשרת', e?.message || 'שגיאה לא צפויה');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>בחירת סגנון משחק</Text>
      <Text style={styles.caption}>
        בחרו קטגוריות ורמת קושי (כוכבים 1–3). 0 כוכבים = לא נבחר.
      </Text>

      <Row title="היכרות" hearts="❤️" value={introLevel} onChange={setIntroLevel} />
      <Row title="כיף"     hearts="❤️❤️" value={funLevel} onChange={setFunLevel} />
      <Row title="תשוקה"   hearts="❤️❤️❤️" value={passionLevel} onChange={setPassionLevel} />

      <TouchableOpacity
        style={[styles.primaryBtn, busy && { opacity: 0.6 }]}
        onPress={goNext}
        disabled={busy}
      >
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>המשך למשחק</Text>}
      </TouchableOpacity>

      <LogoutButton navigation={navigation} style={{ marginTop: 12, width: ROW_W }} />
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 24, backgroundColor: '#f7f7fb', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  caption: { fontSize: 14, color: '#666', marginBottom: 16, textAlign: 'center' },

  row: {
    width: ROW_W, backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: '#e7e7ee',
    marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hearts: { fontSize: 18 },
  label: { fontSize: 16, fontWeight: '600' },

  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  star: { fontSize: 26, lineHeight: 28 },
  clearText: { marginStart: 8, color: '#888', fontSize: 14 },

  primaryBtn: { marginTop: 20, backgroundColor: '#4CAF50', paddingVertical: 14, borderRadius: 12, width: ROW_W, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
