// comp/game/FriendGame/FriendsCardsSelect.jsx
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
import { LogoutButton } from '../../Settings/Settings';
import AnimatedLogo from '../../Settings/AnimatedLogo';

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
// הגדרות מזהים:
// ModeID 1-3 = זוגיות / חברים / משפחה
// CategoryID 1-3 = סגנון השאלות (אותו הדבר לכל מצב משחק)
// LevelID 1-3   = רמת השאלות
// ───────────────────────────────────────────────────────────────

// ✅ CategoryID 1-3 בלבד – גם לגיבוש חברים/עבודה
const CATEGORY_IDS = {
  intro: 1, // היכרות / חימום
  fun: 2,   // כיף / משימות מצחיקות
  team: 3,  // גיבוש / שיתוף פעולה
};

const DEFAULT_COUNT_PER_CAT = 5;

// ✅ ModeID 2 = חברים / עבודה
const CURRENT_MODE_ID = 2;

// חישוב מידות מסך
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ROW_W = Math.min(520, Math.max(320, Math.round(SCREEN_WIDTH - 40)));

// ───────────────────────────────────────────────────────────────
// בקשת כרטיסים מהשרת – עם טיפול ב־404 / No cards found
// ───────────────────────────────────────────────────────────────
async function fetchSelectedCards(selections) {
  let lastErr = null;

  console.log(
    '📤 [FriendsCardsSelect] selections payload:',
    JSON.stringify({ Selections: selections }, null, 2),
  );

  for (const base of API_BASES) {
    for (const path of API_PATHS) {
      const url = `${base}/${path}`;
      console.log('🌐 [FriendsCardsSelect] trying URL:', url);

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

        console.log('📥 [FriendsCardsSelect] raw response:', raw);

        let data = null;
        try {
          data = raw ? JSON.parse(raw) : null;
        } catch (e) {
          console.log('⚠️ JSON parse error:', e.message);
        }

        // ✅ תשובה תקינה – מחזירים את המערך
        if (res.ok) {
          console.log('✅ [FriendsCardsSelect] OK, cards received');
          return data;
        }

        const lowerRaw = (raw || '').toLowerCase();

        // ✅ טיפול מיוחד: 404 או הודעה של "No cards found..."
        if (
          res.status === 404 ||
          lowerRaw.includes('no cards found')
        ) {
          console.log('⚠️ [FriendsCardsSelect] no cards found on', url);
          return { notFound: true };
        }

        const msg = data?.message || data?.error || `HTTP ${res.status}`;
        throw new Error(msg);
      } catch (e) {
        clearTimeout(timeoutId);
        console.log('❌ [FriendsCardsSelect] fetch error:', e.name, e.message);
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
// כרטיס קטגוריה (היכרות / כיף / גיבוש)
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
// FriendsCardsSelect – בחירת קלפים + שחקנים
// ───────────────────────────────────────────────────────────────
export default function FriendsCardsSelect({ navigation, route }) {
  const [userId, setUserId] = useState(route?.params?.userId ?? null);

  // רמות לכל קטגוריה
  const [introLevels, setIntroLevels] = useState([]); // היכרות וחימום
  const [funLevels, setFunLevels] = useState([]);     // משימות מצחיקות
  const [teamLevels, setTeamLevels] = useState([]);   // גיבוש צוות

  const [busy, setBusy] = useState(false);

  // עד 6 שחקנים
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [player3Name, setPlayer3Name] = useState('');
  const [player4Name, setPlayer4Name] = useState('');
  const [player5Name, setPlayer5Name] = useState('');
  const [player6Name, setPlayer6Name] = useState('');

  // טעינת userId מ־SecureStore אם לא הגיע ב־route
  useEffect(() => {
    (async () => {
      if (!userId) {
        const saved = await SecureStore.getItemAsync('lg_userId');
        if (saved) {
          console.log('[FriendsCardsSelect] loaded userId from SecureStore:', saved);
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
          ModeID: CURRENT_MODE_ID, // ✅ 2 = חברים / עבודה
          CategoryID: catId,       // ✅ תמיד 1-3
          LevelID: lvl,            // ✅ 1-3
          NumberOfCards: DEFAULT_COUNT_PER_CAT,
        }),
      );
    };

    if (introLevels.length) addCategory(CATEGORY_IDS.intro, introLevels);
    if (funLevels.length) addCategory(CATEGORY_IDS.fun, funLevels);
    if (teamLevels.length) addCategory(CATEGORY_IDS.team, teamLevels);

    if (selections.length === 0) {
      Alert.alert('רגע אחד', 'יש לבחור לפחות סוג אחד של קלפים.');
      return;
    }

    console.log(
      '▶️ [FriendsCardsSelect] startGame called, selections count:',
      selections.length,
    );
    console.log(
      '▶️ [FriendsCardsSelect] selections object:',
      JSON.stringify(selections, null, 2),
    );

    // רשימת משתתפים – רק מי שבאמת כתב שם
    const names = [
      player1Name?.trim(),
      player2Name?.trim(),
      player3Name?.trim(),
      player4Name?.trim(),
      player5Name?.trim(),
      player6Name?.trim(),
    ];

    const players = names.filter((n) => n && n.length > 0);

    if (players.length === 0) {
      Alert.alert('רגע אחד', 'יש למלא לפחות שם אחד של שחקן/ית.');
      return;
    }

    setBusy(true);
    try {
      const cards = await fetchSelectedCards(selections);

      // ✅ במקרה שאין קלפים – בלי Network Error
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

      console.log(
        '✅ [FriendsCardsSelect] cards received count:',
        cards.length,
      );

      navigation.navigate('FriendsCardsGame', {
        userId,
        gameMode: 'friends',
        selection: {
          intro: introLevels,
          fun: funLevels,
          team: teamLevels,
        },
        cards,
        players,
      });
    } catch (e) {
      console.log('🚨 [FriendsCardsSelect] startGame error:', e?.name, e?.message);
      Alert.alert('שגיאה', e?.message || 'תקלה בהתחברות');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
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
            <Text style={styles.mainTitle}>בחירת משחק – חברים / עבודה</Text>
            <Text style={styles.subTitle}>
              בחרו את סוג הקלפים לקבוצה והכניסו את שמות המשתתפים
            </Text>
          </View>

          {/* שמות משתתפים */}
          <View style={styles.playersSectionFriends}>
            <Text style={styles.playersTitle}>מי משתתף במשחק?</Text>

            <View style={styles.playersGrid}>
              <View style={styles.playerInputBox}>
                <Text style={styles.inputLabel}>👤 שחקן/ית 1</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="שם..."
                  value={player1Name}
                  onChangeText={setPlayer1Name}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.playerInputBox}>
                <Text style={styles.inputLabel}>👤 שחקן/ית 2</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="שם..."
                  value={player2Name}
                  onChangeText={setPlayer2Name}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.playerInputBox}>
                <Text style={styles.inputLabel}>👤 שחקן/ית 3</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="שם..."
                  value={player3Name}
                  onChangeText={setPlayer3Name}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.playerInputBox}>
                <Text style={styles.inputLabel}>👤 שחקן/ית 4</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="שם..."
                  value={player4Name}
                  onChangeText={setPlayer4Name}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.playerInputBox}>
                <Text style={styles.inputLabel}>👤 שחקן/ית 5</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="שם..."
                  value={player5Name}
                  onChangeText={setPlayer5Name}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.playerInputBox}>
                <Text style={styles.inputLabel}>👤 שחקן/ית 6</Text>
                <TextInput
                  style={styles.modernInput}
                  placeholder="שם..."
                  value={player6Name}
                  onChangeText={setPlayer6Name}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

          {/* כרטיסי קטגוריות */}
          <CategoryCard
            title="היכרות וחימום"
            description="שאלות לשבירת קרח ולהיכרות נעימה"
            icon="👥"
            color="#009688"
            selectedLevels={introLevels}
            onChange={setIntroLevels}
          />

          <CategoryCard
            title="משימות מצחיקות"
            description="אתגרים קלילים שיעלו חיוך לכולם"
            icon="😂"
            color="#FF9800"
            selectedLevels={funLevels}
            onChange={setFunLevels}
          />

          <CategoryCard
            title="גיבוש צוות"
            description="קלפים שמחזקים שיתוף פעולה ותחושת ביחד"
            icon="🤝"
            color="#3949AB"
            selectedLevels={teamLevels}
            onChange={setTeamLevels}
          />

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

          {/* חזרה + התנתקות */}
          <TouchableOpacity
            style={styles.backToModeBtn}
            onPress={() => navigation.navigate('GameModeSelect', { userId })}
          >
            <Text style={styles.backToModeText}>⬅ חזרה לבחירת מצב משחק</Text>
          </TouchableOpacity>

          <LogoutButton
            navigation={navigation}
            style={{ alignSelf: 'center', marginTop: 10 }}
          />

          <View style={{ height: 40 }} />
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
    backgroundColor: '#F0F4FF',
  },
  backgroundLogo: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.12,
    alignSelf: 'center',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    opacity: 0.15,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2933',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },

  // אזור משתתפים
  playersSectionFriends: {
    width: ROW_W,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  playersTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
    textAlign: 'right',
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  playerInputBox: {
    width: '48%',
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
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
  },

  // כרטיסי קטגוריות
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cardDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },

  // כוכבים
  starsContainer: {
    flexDirection: 'row',
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

  // כפתור התחלה
  playButton: {
    width: ROW_W,
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
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

  backToModeBtn: {
    marginTop: 16,
  },
  backToModeText: {
    fontSize: 13,
    color: '#4B5563',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
