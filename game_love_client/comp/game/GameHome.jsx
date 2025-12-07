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
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import AnimatedLogo from '../Settings/AnimatedLogo';
import TopMenu from '../Settings/TopMenu';

// ───────────────────────────────────────────────────────────────
// כתובות API (HTTP + HTTPS, ו-uppercase/lowercase של הנתיב)
const API_BASES = [
  'http://lovegame.somee.com/api',
  'https://lovegame.somee.com/api',
];

const API_PATHS = [
  'Users/get-selected-cards',
  'users/get-selected-cards',
];

const CATEGORY_IDS = { intro: 1, fun: 2, passion: 3 };
const DEFAULT_COUNT_PER_CAT = 5;

// מצב משחק למסך הזה: 1 = זוגי
const CURRENT_MODE_ID = 1;

// חישוב מידות מסך
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ROW_W = Math.min(520, Math.max(320, Math.round(SCREEN_WIDTH - 40)));

// ───────────────────────────────────────────────────────────────
// בקשת כרטיסים מהשרת
// ───────────────────────────────────────────────────────────────
async function fetchSelectedCards(selections) {
  let lastErr;

  console.log('📤 selections payload:', JSON.stringify({ Selections: selections }, null, 2));

  for (const base of API_BASES) {
    for (const path of API_PATHS) {
      const url = `${base}/${path}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
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
        } catch (e) {
          console.log('⚠️ JSON parse error:', e.message);
        }

        if (res.ok) {
          return data;
        }

        if (res.status === 404) {
          continue;
        }

        const msg = data?.message || data?.error || `HTTP ${res.status}`;
        throw new Error(msg);
      } catch (e) {
        clearTimeout(timeoutId);
        lastErr = e;
      }
    }
  }

  throw lastErr || new Error('Network/API unreachable');
}

// ───────────────────────────────────────────────────────────────
// קומפוננטה ראשית
// ───────────────────────────────────────────────────────────────
export default function GameHome({ navigation, route }) {
  const [userId, setUserId] = useState(route?.params?.userId ?? null);

  const [introLevels, setIntroLevels] = useState([]);
  const [funLevels, setFunLevels] = useState([]);
  const [passionLevels, setPassionLevels] = useState([]);

  const [busy, setBusy] = useState(false);
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  // טעינת userId מ־SecureStore אם לא הגיע ב־route
  useEffect(() => {
    (async () => {
      if (!userId) {
        const saved = await SecureStore.getItemAsync('lg_userId');
        if (saved) {
          setUserId(saved);
        }
      }
    })();
  }, [userId]);

  // ───────────────────────────────────────────────────────────────
  // קומפוננטת כוכבים לכל קטגוריה
  // ───────────────────────────────────────────────────────────────
  const Stars = ({ selectedLevels, onChange, color }) => {
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
      <View style={styles.starsContainer}>
        <View style={styles.starsRow}>
          {[1, 2, 3].map((i) => {
            const active = selectedLevels.includes(i);
            return (
              <TouchableOpacity
                key={i}
                onPress={() => toggleLevel(i)}
                activeOpacity={0.7}
                style={[
                  styles.starBtn,
                  active && {
                    backgroundColor: color + '20',
                    borderColor: color,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.starText,
                    active ? { color: color } : { color: '#C4C4C4' },
                  ]}
                >
                  {active ? '★' : '☆'}
                </Text>
                <Text
                  style={[
                    styles.levelNum,
                    { color: active ? color : '#999' },
                  ]}
                >
                  {i}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={selectedLevels.length > 0 ? clearAll : selectAll}
          style={styles.miniActionBtn}
        >
          <Text style={styles.miniActionText}>
            {selectedLevels.length > 0 ? 'נקה' : 'בחר הכל'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ───────────────────────────────────────────────────────────────
  // כרטיס קטגוריה (היכרות / כיף / תשוקה)
  // ───────────────────────────────────────────────────────────────
  const CategoryCard = ({
    title,
    icon,
    selectedLevels,
    onChange,
    color,
    description,
  }) => (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 6 }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDesc}>{description}</Text>
        </View>
      </View>

      <View style={styles.divider} />
      <Stars selectedLevels={selectedLevels} onChange={onChange} color={color} />
    </View>
  );

  // ───────────────────────────────────────────────────────────────
  // לחיצה על "מתחילים לשחק"
  // ───────────────────────────────────────────────────────────────
  const goNext = async () => {
    if (!userId) {
      Alert.alert('שגיאה', 'חסר מזהה משתמש.');
      return;
    }

    const selections = [];

    // מוסיפים ModeID לכל בחירה (מצב זוגי)
    const addCategory = (catId, levelsArr) => {
      levelsArr.forEach((lvl) =>
        selections.push({
          ModeID: CURRENT_MODE_ID, // 1 = זוגי
          CategoryID: catId,
          LevelID: lvl,
          NumberOfCards: DEFAULT_COUNT_PER_CAT,
        }),
      );
    };

    if (introLevels.length) addCategory(CATEGORY_IDS.intro, introLevels);
    if (funLevels.length) addCategory(CATEGORY_IDS.fun, funLevels);
    if (passionLevels.length) addCategory(CATEGORY_IDS.passion, passionLevels);

    if (selections.length === 0) {
      Alert.alert('רגע אחד', 'יש לבחור לפחות סוג אחד של קלפים.');
      return;
    }

    console.log('▶️ goNext called, selections count:', selections.length);

    setBusy(true);
    try {
      const cards = await fetchSelectedCards(selections);

      if (!Array.isArray(cards) || cards.length === 0) {
        Alert.alert('אופס', 'לא נמצאו קלפים.');
        return;
      }

      console.log('✅ received cards count:', cards.length);

      navigation.navigate('IndexGame', {
        userId,
        selection: {
          intro: introLevels,
          fun: funLevels,
          passion: passionLevels,
        },
        cards,
        players: [
          player1Name?.trim() || 'שחקן 1',
          player2Name?.trim() || 'שחקן 2',
        ],
      });
    } catch (e) {
      console.log('🚨 goNext error:', e?.name, e?.message);
      Alert.alert('שגיאה', e?.message || 'תקלה בהתחברות');
    } finally {
      setBusy(false);
    }
  };

  // --- ניווט מהתפריט ---
  const handleMenuLogout = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };
  const showInfo = (msg) => Alert.alert('מידע', msg);

  // ───────────────────────────────────────────────────────────────
  // UI
  // ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.mainContainer}>
      <StatusBar style="dark" />
      
      {/* תפריט עליון */}
      <TopMenu
        navigation={navigation}
        onSelectCoupleCards={() => {}} // אנחנו כבר כאן
        onSelectFamilyCards={() => navigation.navigate('FamilyCardsSelect', { userId })}
        onSelectFriendsCards={() => navigation.navigate('FriendsCardsSelect', { userId })}
        onContact={() => showInfo('צור קשר - בקרוב')}
        onFeedback={() => showInfo('פידבק - בקרוב')}
        onHelp={() => showInfo('עזרה - בקרוב')}
        onLogout={handleMenuLogout}
      />

      {/* לוגו אנימציה ברקע */}
      <AnimatedLogo style={styles.backgroundLogo} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentWrapper}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* כותרת */}
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>בונים את המשחק</Text>
            <Text style={styles.subTitle}>בחרו את האווירה להערב</Text>
          </View>

          {/* שמות שחקנים */}
          <View style={styles.playersSection}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>💙 שחקן/ית 1</Text>
              <TextInput
                style={styles.modernInput}
                placeholder="שם..."
                value={player1Name}
                onChangeText={setPlayer1Name}
                placeholderTextColor="#9CA3AF"
                textAlign="right"
              />
            </View>

            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>&</Text>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>❤️ שחקן/ית 2</Text>
              <TextInput
                style={styles.modernInput}
                placeholder="שם..."
                value={player2Name}
                onChangeText={setPlayer2Name}
                placeholderTextColor="#9CA3AF"
                textAlign="right"
              />
            </View>
          </View>

          {/* כרטיסי קטגוריות */}
          <CategoryCard
            title="היכרות וחיבור"
            description="שאלות עומק לשיחה אמיתית"
            icon="🥂"
            color="#2196F3"
            selectedLevels={introLevels}
            onChange={setIntroLevels}
          />

          <CategoryCard
            title="קליל וכיף"
            description="משימות מצחיקות ואווירה טובה"
            icon="😜"
            color="#FF9800"
            selectedLevels={funLevels}
            onChange={setFunLevels}
          />

          <CategoryCard
            title="תשוקה ואינטימיות"
            description="להעלות את הטמפרטורה..."
            icon="🔥"
            color="#E91E63"
            selectedLevels={passionLevels}
            onChange={setPassionLevels}
          />

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* כפתור קבוע למטה – כמו במשחק משפחה */}
        <View style={styles.footerRow}>
          <TouchableOpacity
            style={[styles.playButton, busy && styles.playButtonDisabled]}
            onPress={goNext}
            disabled={busy}
            activeOpacity={0.8}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.playButtonText}>מתחילים לשחק</Text>
                <Text style={styles.playButtonIcon}>🚀</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ───────────────────────────────────────────────────────────────
// עיצוב
// ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF5F7',
  },

  backgroundLogo: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.15,
    alignSelf: 'center',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    opacity: 0.3,
  },

  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },

  scrollContent: {
    alignItems: 'center',
    paddingTop: 85, // מקום לתפריט העליון
    paddingHorizontal: 16,
  },

  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },

  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },

  playersSection: {
    flexDirection: 'row',
    width: ROW_W,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    marginBottom: 6,
    marginLeft: 4,
    textAlign: 'right',
  },
  modernInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333',
    textAlign: 'right',
  },

  vsBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFE4E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    marginTop: 16,
  },
  vsText: {
    color: '#E91E63',
    fontWeight: 'bold',
    fontSize: 12,
  },

  card: {
    width: ROW_W,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cardIcon: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'right',
  },
  cardDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },

  starsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  starText: {
    fontSize: 24,
    lineHeight: 28,
  },
  levelNum: {
    fontSize: 10,
    marginTop: -2,
    fontWeight: 'bold',
  },

  miniActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  miniActionText: {
    fontSize: 12,
    color: '#777',
    fontWeight: '600',
  },

  footerRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  playButton: {
    width: ROW_W,
    backgroundColor: '#E91E63',
    paddingVertical: 16,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  playButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#999',
    shadowOpacity: 0,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  playButtonIcon: {
    fontSize: 20,
  },
});
