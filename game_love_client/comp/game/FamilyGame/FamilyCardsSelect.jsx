import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// --- רכיבים חיצוניים ---
import TopMenu from '../../Settings/TopMenu'; // ✅ התפריט החדש

const { width } = Dimensions.get('window');

// נתונים סטטיים לקטגוריות (בהתאם לתמונה)
const CATEGORIES = [
  {
    id: 1,
    title: 'היכרות משפחתית',
    subtitle: 'שאלות לשבירת קרח וחיבור בין כל בני הבית',
    color: '#10B981', // Green
    icon: 'account-group',
    stars: 1,
  },
  {
    id: 2,
    title: 'כיף וצחוקים',
    subtitle: 'אתגרים קלילים שיעלו צחוק לגדולים ולקטנים',
    color: '#F59E0B', // Orange
    icon: 'emoticon-lol-outline',
    stars: 2,
  },
  {
    id: 3,
    title: 'גיבוש משפחתי',
    subtitle: 'קלפים שמחזקים שיתוף פעולה ותחושת ביחד',
    color: '#6366F1', // Indigo
    icon: 'handshake-outline',
    stars: 3,
  },
];

export default function FamilyCardsSelect({ navigation, route }) {
  const userId = route?.params?.userId || 0;
  
  // ניהול שמות השחקנים (6 שדות כמו בתמונה)
  const [players, setPlayers] = useState({
    1: '', 2: '', 3: '', 4: '', 5: '', 6: ''
  });

  // ניהול בחירת קטגוריות
  const [selectedCats, setSelectedCats] = useState([1, 2, 3]); // ברירת מחדל: הכל נבחר

  const toggleCategory = (id) => {
    if (selectedCats.includes(id)) {
      setSelectedCats(selectedCats.filter((c) => c !== id));
    } else {
      setSelectedCats([...selectedCats, id]);
    }
  };

  const updatePlayerName = (id, text) => {
    setPlayers((prev) => ({ ...prev, [id]: text }));
  };

  const handleStartGame = () => {
    // 1. סינון שחקנים ריקים
    const activePlayers = Object.values(players).filter(p => p.trim().length > 0);

    // בדיקות תקינות
    if (activePlayers.length < 2) {
      Alert.alert('רגע...', 'יש להזין לפחות שני שמות של משתתפים כדי להתחיל.');
      return;
    }

    if (selectedCats.length === 0) {
      Alert.alert('שגיאה', 'יש לבחור לפחות קטגוריה אחת.');
      return;
    }

    // 2. הכנת הקלפים (סימולציה - כאן היית שולף מה-DB או מסנן מערך קיים)
    // לצורך הדוגמה אני יוצר קלפים דמה, בפועל תשלח את ה-IDs לשרת או תסנן רשימה מקומית
    const dummyCards = []; 
    // ... לוגיקת שליפת קלפים לפי selectedCats ...
    // כאן נניח שאנחנו מעבירים רשימה ריקה והמשחק יטפל בזה, 
    // או שתעביר את הקלפים האמיתיים מה-DB שלך.
    // בדוגמה זו אני מעביר מערך דמה כדי שהמשחק לא יקרוס:
    for(let i=0; i<30; i++) {
        dummyCards.push({ id: i, categoryID: (i % 3) + 1, levelID: (i % 3) + 1, description: 'שאלה לדוגמה...' });
    }

    // 3. ניווט למשחק
    navigation.navigate('FamilyCardsGame', {
      userId,
      players: activePlayers,
      cards: dummyCards, // בפועל: CardsData.filter(...)
    });
  };
  
  // --- ניווט מהתפריט ---
  const handleMenuLogout = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const showInfo = (msg) => Alert.alert('מידע', msg);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* ✅ תפריט עליון */}
      <TopMenu
        navigation={navigation}
        onSelectCoupleCards={() => navigation.navigate('GameModeSelect')}
        onSelectFamilyCards={() => {}} // כבר כאן
        onSelectFriendsCards={() => navigation.navigate('FriendsCardsSelect', { userId })}
        onContact={() => showInfo('צור קשר - בקרוב')}
        onFeedback={() => showInfo('פידבק - בקרוב')}
        onHelp={() => showInfo('עזרה - בקרוב')}
        onLogout={handleMenuLogout}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
          {/* כותרת */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>בחירת משחק – משפחה</Text>
            <Text style={styles.headerSubtitle}>
              בחרו את סוג הקלפים למשחק משפחתי והכניסו את שמות המשתתפים
            </Text>
          </View>

          {/* אזור הזנת שמות */}
          <View style={styles.playersCard}>
            <Text style={styles.playersTitle}>מי משתתף במשחק? (הורים, ילדים, סבים...)</Text>
            
            <View style={styles.inputsGrid}>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <View key={num} style={styles.inputWrapper}>
                  <View style={styles.labelRow}>
                    <MaterialCommunityIcons name="account" size={14} color="#2563EB" />
                    <Text style={styles.inputLabel}>שחקן/ית {num}</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="שם..."
                    placeholderTextColor="#9CA3AF"
                    value={players[num]}
                    onChangeText={(text) => updatePlayerName(num, text)}
                    textAlign="right"
                  />
                </View>
              ))}
            </View>
          </View>

          {/* רשימת קטגוריות */}
          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCats.includes(cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.9}
                  onPress={() => toggleCategory(cat.id)}
                  style={[
                    styles.catCard,
                    { borderLeftColor: cat.color } // הפס הצבעוני בצד
                  ]}
                >
                  <View style={styles.catContent}>
                    <View style={styles.catHeader}>
                      <View style={styles.iconBox}>
                        <MaterialCommunityIcons name={cat.icon} size={28} color="#374151" />
                      </View>
                      <View style={{ flex: 1, paddingHorizontal: 10 }}>
                        <Text style={styles.catTitle}>{cat.title}</Text>
                        <Text style={styles.catSubtitle}>{cat.subtitle}</Text>
                      </View>
                    </View>

                    <View style={styles.catFooter}>
                      <View style={styles.starsRow}>
                        {[...Array(3)].map((_, i) => (
                          <MaterialCommunityIcons
                            key={i}
                            name={i < cat.stars ? "star" : "star-outline"}
                            size={18}
                            color="#9CA3AF"
                          />
                        ))}
                      </View>

                      <TouchableOpacity 
                        style={[
                            styles.selectBtn, 
                            isSelected ? styles.btnSelected : styles.btnUnselected
                        ]}
                        onPress={() => toggleCategory(cat.id)}
                      >
                        <Text style={[
                            styles.selectBtnText,
                            isSelected ? { color: '#fff' } : { color: '#6B7280' }
                        ]}>
                            {isSelected ? 'נבחר ✓' : 'בחר'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        
          <View style={{ height: 100 }} /> 
        </ScrollView>
      </KeyboardAvoidingView>

      {/* כפתור התחלה צף למטה */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.startBtn} onPress={handleStartGame}>
            <LinearGradient
                colors={['#4F46E5', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientBtn}
            >
                <Text style={styles.startBtnText}>התחל משחק</Text>
                <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // רקע אפור בהיר מאוד
  },
  scrollContent: {
    paddingTop: 80, // מקום לתפריט העליון
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
  // כרטיס שחקנים
  playersCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginBottom: 24,
  },
  playersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  inputsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inputWrapper: {
    width: '48%', // שתי עמודות
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  inputLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  // קטגוריות
  categoriesContainer: {
    gap: 16,
  },
  catCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderLeftWidth: 6, // הפס הצבעוני
    padding: 16,
  },
  catContent: {
    flex: 1,
  },
  catHeader: {
    flexDirection: 'row-reverse', // כדי שהאייקון יהיה מימין והטקסט משמאל (או להיפך לפי העדפה, כאן RTL)
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'right',
    marginBottom: 4,
  },
  catSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'right',
    lineHeight: 18,
  },
  catFooter: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  selectBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  btnUnselected: {
    backgroundColor: '#F3F4F6',
  },
  btnSelected: {
    backgroundColor: '#10B981', // ירוק כשהוא נבחר
  },
  selectBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // כפתור תחתון
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  startBtn: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});