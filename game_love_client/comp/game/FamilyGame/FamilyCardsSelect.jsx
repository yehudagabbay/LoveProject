// comp/game/FamilyGame/FamilyCardsSelect.jsx
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
import AnimatedLogo from '../../Settings/AnimatedLogo';
import TopMenu from '../../Settings/TopMenu';

// ───────────────────────────────────────────────────────────────
// כתובות API (HTTP + HTTPS)
// ───────────────────────────────────────────────────────────────
const API_BASES = [
  'http://lovegame.somee.com/api',
  'https://lovegame.somee.com/api',
];

const API_PATHS = [
  'Users/get-selected-cards',
  'users/get-selected-cards',
];

// ───────────────────────────────────────────────────────────────
// הגדרות מזהים
// ───────────────────────────────────────────────────────────────
const CATEGORY_IDS = {
  intro: 1, // היכרות משפחתית
  fun: 2,   // כיף / צחוקים
  team: 3,  // גיבוש משפחתי
};

const DEFAULT_COUNT_PER_CAT = 5;
// ⚠️ ודא שזה אותו ModeID שהגדרת למשחק משפחה בטבלה
const CURRENT_MODE_ID = 3; // משפחה

// חישוב מידות מסך
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ROW_W = Math.min(520, Math.max(320, Math.round(SCREEN_WIDTH - 40)));

// ───────────────────────────────────────────────────────────────
// בקשת כרטיסים מהשרת
// ───────────────────────────────────────────────────────────────
async function fetchSelectedCards(selections) {
  let lastErr = null;

  console.log(
    '📤 [FamilyCardsSelect] selections payload:',
    JSON.stringify({ Selections: selections }, null, 2),
  );

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
          console.log('⚠️ JSON parse error (family):', e.message);
        }

        if (res.ok) {
          return data;
        }

        const lowerRaw = (raw || '').toLowerCase();
        if (
          res.status === 404 ||
          lowerRaw.includes('no cards found')
        ) {
          return { notFound: true };
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
// קומפוננטת כוכבים (בחירת רמת קושי)
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
// כרטיס קטגוריה
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
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{description}</Text>
      </View>
    </View>

    <View style={styles.divider} />
    <Stars selectedLevels={selectedLevels} onChange={onChange} color={color} />
  </View>
);

// ───────────────────────────────────────────────────────────────
// FamilyCardsSelect – מסך ראשי
// ───────────────────────────────────────────────────────────────
export default function FamilyCardsSelect({ navigation, route }) {
  const [userId, setUserId] = useState(route?.params?.userId ?? null);

  // רמות לכל קטגוריה
  const [introLevels, setIntroLevels] = useState([]);
  const [funLevels, setFunLevels] = useState([]);
  const [teamLevels, setTeamLevels] = useState([]);

  const [busy, setBusy] = useState(false);

  // עד 6 שחקנים
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player3Name, setPlayer3Name] = useState('');
  const [player4Name, setPlayer4Name] = useState('');
  const [player5Name, setPlayer5Name] = useState('');
  const [player6Name, setPlayer6Name] = useState('');

  // טעינת userId
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

  const startGame = async () => {
    if (!userId) {
      Alert.alert('שגיאה', 'חסר מזהה משתמש.');
      return;
    }

    const selections = [];

    const addCategory = (catId, levelsArr) => {
      levelsArr.forEach((lvl) =>
        selections.push({
          ModeID: CURRENT_MODE_ID,
          CategoryID: catId,
          LevelID: lvl,
          NumberOfCards: DEFAULT_COUNT_PER_CAT,
        }),
      );
    };

    if (introLevels.length) addCategory(CATEGORY_IDS.intro, introLevels);
    if (funLevels.length) addCategory(CATEGORY_IDS.fun, funLevels);
    if (teamLevels.length) addCategory(CATEGORY_IDS.team, teamLevels);

    if (selections.length === 0) {
      Alert.alert(
        'רגע אחד',
        'יש לבחור לפחות סוג אחד של קלפים (לסמן כוכבים).',
      );
      return;
    }

    const names = [
      player1Name?.trim(),
      player2Name?.trim(),
      player3Name?.trim(),
      player4Name?.trim(),
      player5Name?.trim(),
      player6Name?.trim(),
    ];

    const players = names.filter((n) => n && n.length > 0);

    // ✅ למשפחה חייבים לפחות שני שמות
    if (players.length < 2) {
      Alert.alert(
        'רגע אחד',
        'במשחק משפחתי יש למלא לפחות שני שמות של שחקנים/יות.',
      );
      return;
    }

    setBusy(true);
    try {
      const cards = await fetchSelectedCards(selections);

      if (cards && cards.notFound) {
        Alert.alert(
          'אופס',
          'לא נמצאו קלפים מתאימים לבחירה הזו.\nנסה לשנות קטגוריה או רמת קושי.',
        );
        return;
      }

      if (!Array.isArray(cards) || cards.length === 0) {
        Alert.alert('אופס', 'לא נמצאו קלפים.');
        return;
      }

      navigation.navigate('FamilyCardsGame', {
        userId,
        gameMode: 'family',
        selection: {
          intro: introLevels,
          fun: funLevels,
          team: teamLevels,
        },
        cards,
        players,
      });
    } catch (e) {
      console.log('🚨 startGame (family) error:', e?.message);
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

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="dark" />

      {/* תפריט עליון */}
      <TopMenu
        navigation={navigation}
        onSelectCoupleCards={() => navigation.navigate('GameModeSelect')}
        onSelectFamilyCards={() => {}} // אנחנו כבר כאן
        onSelectFriendsCards={() =>
          navigation.navigate('FriendsCardsSelect', { userId })
        }
        onContact={() => showInfo('צור קשר - בקרוב')}
        onFeedback={() => showInfo('פידבק - בקרוב')}
        onHelp={() => showInfo('עזרה - בקרוב')}
        onLogout={handleMenuLogout}
      />

      <AnimatedLogo style={styles.backgroundLogo} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* כותרת */}
          <View style={styles.headerContainer}>
            <Text style={styles.mainTitle}>בחירת משחק – משפחה</Text>
            <Text style={styles.subTitle}>
              בחרו את סוג הקלפים למשחק משפחתי והכניסו את שמות המשתתפים
            </Text>
          </View>

          {/* שמות משתתפים */}
          <View style={styles.playersSectionFriends}>
            <Text style={styles.playersTitle}>מי משתתף במשחק?</Text>

            <View style={styles.playersGrid}>
              {[
                { label: 'שחקן/ית 1', val: player1Name, set: setPlayer1Name },
                { label: 'שחקן/ית 2', val: player2Name, set: setPlayer2Name },
                { label: 'שחקן/ית 3', val: player3Name, set: setPlayer3Name },
                { label: 'שחקן/ית 4', val: player4Name, set: setPlayer4Name },
                { label: 'שחקן/ית 5', val: player5Name, set: setPlayer5Name },
                { label: 'שחקן/ית 6', val: player6Name, set: setPlayer6Name },
              ].map((p, idx) => (
                <View key={idx} style={styles.playerInputBox}>
                  <Text style={styles.inputLabel}>{p.label}</Text>
                  <TextInput
                    style={styles.modernInput}
                    placeholder="שם..."
                    value={p.val}
                    onChangeText={p.set}
                    placeholderTextColor="#9CA3AF"
                    textAlign="right"
                  />
                </View>
              ))}
            </View>
          </View>

          {/* כרטיסי קטגוריות */}
          <View style={styles.cardsContainer}>
            <CategoryCard
              title="היכרות משפחתית"
              description="שאלות לשבירת קרח וחיבור בין כל בני הבית"
              icon="👨‍👩‍👧‍👦"
              color="#10B981"
              selectedLevels={introLevels}
              onChange={setIntroLevels}
            />

            <CategoryCard
              title="כיף וצחוקים"
              description="אתגרים קלילים שיעלו צחוק לגדולים ולקטנים"
              icon="😄"
              color="#F59E0B"
              selectedLevels={funLevels}
              onChange={setFunLevels}
            />

            <CategoryCard
              title="גיבוש משפחתי"
              description="קלפים שמחזקים שיתוף פעולה ותחושת ביחד"
              icon="🏠"
              color="#6366F1"
              selectedLevels={teamLevels}
              onChange={setTeamLevels}
            />
          </View>

          {/* כפתור התחלה */}
          <TouchableOpacity
            style={[styles.playButton, busy && styles.playButtonDisabled]}
            onPress={startGame}
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

          <View style={{ height: 60 }} />
        </ScrollView>
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
    backgroundColor: '#F3F4F6',
  },
  backgroundLogo: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.15,
    alignSelf: 'center',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    opacity: 0.1,
  },
  scrollContent: {
    paddingTop: 85,
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: '90%',
  },

  playersSectionFriends: {
    width: ROW_W,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  playersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  playerInputBox: {
    width: '47%',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
    textAlign: 'right',
  },
  modernInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  cardsContainer: {
    width: ROW_W,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'right',
  },
  cardDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'right',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
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
    width: 44,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  starText: {
    fontSize: 22,
    lineHeight: 26,
  },
  levelNum: {
    fontSize: 10,
    marginTop: -2,
    fontWeight: '700',
  },
  miniActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  miniActionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  playButton: {
    width: ROW_W,
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#9CA3AF',
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
