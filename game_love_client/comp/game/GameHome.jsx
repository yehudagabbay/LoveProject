// comp/game/GameHome.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
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
// כמה קלפים לכל קטגוריה/רמה
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
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ Selections: selections }),
          signal: controller.signal,
        });

        const raw = await res.text();
        clearTimeout(timeoutId);

        let data = null;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch {
          // not JSON
        }

        if (res.ok) {
          console.log(
            '✓ response 200',
            Array.isArray(data) ? `cards=${data.length}` : data
          );
          return data;
        }

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
      }
    }
  }

  throw lastErr || new Error('Network/API unreachable');
}

// ───────────────────────────────────────────────────────────────────────────────

export default function GameHome({ navigation, route }) {
  const [userId, setUserId] = useState(route?.params?.userId ?? null);

  // דרגות קושי — עכשיו מערכים (אפשר כמה רמות יחד לכל קטגוריה)
  const [introLevels, setIntroLevels] = useState([]);    // היכרות
  const [funLevels, setFunLevels] = useState([]);        // כיף
  const [passionLevels, setPassionLevels] = useState([]); // תשוקה

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      if (!userId) {
        const saved = await SecureStore.getItemAsync('lg_userId');
        if (saved) setUserId(saved);
      }
    })();
  }, [userId]);

  // כוכבים מרובי־בחירה (אפשר לבחור כמה רמות, או "הכול" / "נקה")
  const Stars = ({ selectedLevels, onChange }) => {
    const toggleLevel = (lvl) => {
      if (selectedLevels.includes(lvl)) {
        onChange(selectedLevels.filter((x) => x !== lvl));
      } else {
        onChange([...selectedLevels, lvl].sort());
      }
    };

    const selectAll = () => onChange([1, 2, 3]);
    const clearAll = () => onChange([]);

    return (
      <View style={styles.starsRow}>
        {[1, 2, 3].map((i) => {
          const active = selectedLevels.includes(i);
          return (
            <TouchableOpacity key={i} onPress={() => toggleLevel(i)}>
              <Text style={[styles.star, active && { color: '#FFC107' }]}>
                {active ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          );
        })}

        {selectedLevels.length > 0 ? (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearText}>נקה</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={selectAll}>
            <Text style={styles.clearText}>הכול</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const Row = ({ title, hearts, selectedLevels, onChange }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.hearts}>{hearts}</Text>
        <Text style={styles.label}>{title}</Text>
      </View>
      <Stars selectedLevels={selectedLevels} onChange={onChange} />
    </View>
  );

  // בניית Selection: כל קטגוריה × כל רמה = רשומה נפרדת
  const buildSelections = () => {
    const arr = [];

    const addCategory = (catId, levelsArr) => {
      levelsArr.forEach((lvl) => {
        arr.push({
          CategoryID: catId,
          LevelID: lvl,
          NumberOfCards: DEFAULT_COUNT_PER_CAT,
        });
      });
    };

    if (introLevels.length) addCategory(CATEGORY_IDS.intro, introLevels);
    if (funLevels.length) addCategory(CATEGORY_IDS.fun, funLevels);
    if (passionLevels.length) addCategory(CATEGORY_IDS.passion, passionLevels);

    return arr;
  };

  const goNext = async () => {
    if (!userId) {
      Alert.alert('שגיאה', 'לא נמצא מזהה משתמש (userId). התחבר/י מחדש.');
      return;
    }

    const selections = buildSelections();
    if (selections.length === 0) {
      Alert.alert(
        'בחירה נדרשת',
        'בחר/י לפחות קטגוריה אחת ורמת קושי אחת (אפשר כמה רמות לכל קטגוריה).'
      );
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
        selection: {
          intro: introLevels,
          fun: funLevels,
          passion: passionLevels,
        },
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
        בחרו לכל קטגוריה את רמות הקושי הרצויות (אפשר כמה כוכבים יחד, או "הכול").
      </Text>

      <Row
        title="היכרות"
        hearts="❤️"
        selectedLevels={introLevels}
        onChange={setIntroLevels}
      />
      <Row
        title="כיף"
        hearts="❤️❤️"
        selectedLevels={funLevels}
        onChange={setFunLevels}
      />
      <Row
        title="תשוקה"
        hearts="❤️❤️❤️"
        selectedLevels={passionLevels}
        onChange={setPassionLevels}
      />

      <TouchableOpacity
        style={[styles.primaryBtn, busy && { opacity: 0.6 }]}
        onPress={goNext}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>המשך למשחק</Text>
        )}
      </TouchableOpacity>

      <LogoutButton navigation={navigation} style={{ marginTop: 12, width: ROW_W }} />
    </View>
  );
}

// ───────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: '#f7f7fb',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  caption: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },

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
  star: { fontSize: 26, lineHeight: 28, color: '#999' },
  clearText: { marginStart: 8, color: '#888', fontSize: 14 },

  primaryBtn: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    width: ROW_W,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
