// comp/game/IndexGame.jsx
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  Image,
  PanResponder,
  TextInput, // תיבת טקסט למשוב
} from 'react-native';
import { LogoutButton } from '../Settings/Settings';
import logo1 from '../../assets/images/logo1.png';

// אייקונים
import iconLove from '../../assets/images/icons/love.png';
import iconFun from '../../assets/images/icons/fun.png';
import iconRelations from '../../assets/images/icons/relations.png';

// --- חישוב רוחב מסך ---
const W = Math.min(
  520,
  Math.max(320, Math.round(Dimensions.get('window').width - 40)),
);

// ================== כתובת API למשוב ==================
const FEEDBACK_URL =
  'http://lovegame.somee.com/api/Users/submit-feedback';

// הוצאת UserID מתוך ה־route
const getCurrentUserId = (route) =>
  route?.params?.userId ??
  route?.params?.user?.UserID ??
  0;
// =====================================================

// --- קבועים ועזרים ---
const CAT_COLORS = { 1: '#1976D2', 2: '#009688', 3: '#E91E63' };
const categoryName = (id) =>
  id === 1 ? 'היכרות' : id === 2 ? 'כיף' : 'תשוקה';
const levelName = (id) =>
  id === 1 ? 'קל' : id === 2 ? 'בינוני' : 'קשה';
const heartsByCat = { 1: '💙', 2: '💙💙', 3: '💙💙💙' };
const stars = (n) => '⭐'.repeat(Math.max(1, Math.min(3, n)));

const CATEGORY_THEME = {
  1: {
    name: 'Relations',
    bgColor: '#FDB4A4',
    icon: iconRelations,
  },
  2: {
    name: 'Fun',
    bgColor: '#FBB6E1',
    icon: iconFun,
  },
  3: {
    name: 'Love',
    bgColor: '#FCD29F',
    icon: iconLove,
  },
};

const DEFAULT_THEME = {
  name: 'Default',
  bgColor: '#F97373',
  icon: null,
};

// שכבות החפיסה
const DECK_LAYERS = [
  { rotate: '-6deg', translate: -4, zIndex: 1, opacity: 0.85, scale: 0.92 },
  { rotate: '4deg', translate: -2, zIndex: 2, opacity: 0.95, scale: 0.96 },
  { rotate: '0deg', translate: 0, zIndex: 3, opacity: 1.0, scale: 1.0 },
];

export default function IndexGame({ route, navigation }) {
  const { cards = [] } = route?.params || {};

  // --- אנימציות ---
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;
  const flyOutAnim = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(100),
      Animated.spring(entryAnim, {
        toValue: 1,
        friction: 5,
        tension: 30,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [entryAnim, pulseAnim]);

  // --- לוגיקה של הקלפים ---
  const mapById = useMemo(() => {
    const m = new Map();
    for (const c of cards) {
      const id = c.cardID ?? c.CardID ?? c.id;
      m.set(id, c);
    }
    return m;
  }, [cards]);

  const [remaining, setRemaining] = useState(
    () => new Set(cards.map((c) => c.cardID ?? c.CardID ?? c.id)),
  );
  const [currentCardId, setCurrentCardId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [lastCombo, setLastCombo] = useState(null);

  // --- משוב: מצב שליחת משוב + מודאל נפרד ---
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const remainingCount = remaining.size;
  const totalCount = cards.length;

  const revealRandomCard = () => {
    if (remaining.size === 0) return;

    const ids = Array.from(remaining);
    const randIdx = Math.floor(Math.random() * ids.length);
    const id = ids[randIdx];
    const chosen = mapById.get(id);
    if (!chosen) return;

    setCurrentCardId(id);
    setShowModal(true);
  };

  const handleDrawPress = () => {
    if (remainingCount === 0) {
      Alert.alert(
        'נגמרו הקלפים',
        'שיחקתם בכל הקלפים. חזור להגדרות למשחק חדש.',
      );
      return;
    }

    Animated.timing(flyOutAnim, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      flyOutAnim.setValue(0);
      revealRandomCard();
    });
  };

  const closeCardModal = () => {
    setShowModal(false);
  };

  const finishCard = () => {
    if (currentCardId) {
      const card = mapById.get(currentCardId);
      if (card) {
        setLastCombo({
          categoryID: card.CategoryID ?? card.categoryID,
          levelID: card.LevelID ?? card.levelID,
        });
        setRemaining((prev) => {
          const n = new Set(prev);
          n.delete(currentCardId);
          return n;
        });
        setRevealedCount((n) => n + 1);
      }
    }
    setCurrentCardId(null);
    closeCardModal();
  };

  const skipCard = () => {
    if (currentCardId) {
      const card = mapById.get(currentCardId);
      if (card) {
        setLastCombo({
          categoryID: card.CategoryID ?? card.categoryID,
          levelID: card.LevelID ?? card.levelID,
        });
      }
    }
    setCurrentCardId(null);
    closeCardModal();
  };

  // --- פתיחת מודאל המשוב (בלי לשלוח עדיין) ---
  const openFeedbackModal = () => {
    if (!currentCardId) return;

    const userId = getCurrentUserId(route);
    if (!userId || userId <= 0) {
      Alert.alert(
        'שגיאה',
        'לא נמצא משתמש מחובר לשליחת משוב. חזרו להתחברות ונסו שוב.',
      );
      return;
    }

    setFeedbackText('');
    setFeedbackModalVisible(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalVisible(false);
    setFeedbackText('');
  };

  // --- שליחת המשוב בפועל ל־API ---
  const submitFeedback = async () => {
    if (!currentCardId) return;

    const card = mapById.get(currentCardId);
    if (!card) return;

    const userId = getCurrentUserId(route);
    if (!userId || userId <= 0) {
      Alert.alert(
        'שגיאה',
        'לא נמצא משתמש מחובר לשליחת משוב. חזרו להתחברות ונסו שוב.',
      );
      return;
    }

    if (!feedbackText.trim()) {
      Alert.alert('משוב חסר', 'כתבו כמה מילים לפני שליחת המשוב.');
      return;
    }

    const payload = {
      UserID: userId,
      CardID: card.CardID ?? card.cardID ?? card.id ?? 0,
      Rating: 5,
      Comment: feedbackText.trim(),
    };

    try {
      setSendingFeedback(true);

      const res = await fetch(FEEDBACK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.log('Feedback error body:', errorText);
        throw new Error(
          errorText || `Feedback status not OK: ${res.status}`,
        );
      }

      Alert.alert('תודה!', 'המשוב נשלח בהצלחה.');
      closeFeedbackModal();
    } catch (err) {
      console.error('Error sending feedback:', err);
      Alert.alert(
        'שגיאה',
        'לא ניתן היה לשלוח את המשוב כרגע, נסו שוב מאוחר יותר.',
      );
    } finally {
      setSendingFeedback(false);
    }
  };

  const currentCard =
    currentCardId != null ? mapById.get(currentCardId) : null;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !showModal && remainingCount > 0,
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false },
    ),
    onPanResponderRelease: (e, gesture) => {
      const threshold = 80;
      if (Math.abs(gesture.dx) > threshold) {
        Animated.timing(pan.x, {
          toValue: gesture.dx > 0 ? 400 : -400,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          pan.setValue({ x: 0, y: 0 });
          if (!showModal && remainingCount > 0) {
            revealRandomCard();
          }
        });
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const rawCategoryId =
    currentCard?.CategoryID ?? currentCard?.categoryID ?? null;
  const currentCategoryId =
    rawCategoryId !== null && rawCategoryId !== undefined
      ? Number(rawCategoryId)
      : null;

  const currentTheme =
    (currentCategoryId && CATEGORY_THEME[currentCategoryId]) ||
    DEFAULT_THEME;

  return (
    <View style={styles.screen}>
      {/* --- חצי עליון: חפיסת הקלפים --- */}
      <View style={styles.topHalf}>
        <View style={styles.deckContainer}>
          {remainingCount > 0 ? (
            <View style={styles.cardStackWrapper}>
              {DECK_LAYERS.map((layer, index) => {
                const isVisible = remainingCount >= 3 - index;
                if (!isVisible && remainingCount < 3) return null;

                const isTopCard = index === 2;

                const animatedRotate = entryAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', layer.rotate],
                });
                const spreadTranslateY = entryAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, layer.translate],
                });
                const entrySlideUp = entryAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                });
                const spreadScale = entryAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, layer.scale],
                });
                const breathTranslate = pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5],
                });

                const flyTranslateY = isTopCard
                  ? flyOutAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -180],
                    })
                  : 0;
                const flyRotate = isTopCard
                  ? flyOutAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '20deg'],
                    })
                  : '0deg';
                const flyOpacity = isTopCard
                  ? flyOutAnim.interpolate({
                      inputRange: [0, 0.6],
                      outputRange: [1, 0],
                    })
                  : 1;

                const baseTransforms = [
                  {
                    rotate:
                      isTopCard && flyOutAnim._value > 0
                        ? flyRotate
                        : animatedRotate,
                  },
                  { translateY: entrySlideUp },
                  { translateY: spreadTranslateY },
                  { translateY: breathTranslate },
                  { translateY: flyTranslateY },
                  { scale: spreadScale },
                ];

                const finalTransforms = isTopCard
                  ? [
                      ...baseTransforms,
                      { translateX: pan.x },
                      { translateY: pan.y },
                    ]
                  : baseTransforms;

                return (
                  <Animated.View
                    key={index}
                    {...(isTopCard ? panResponder.panHandlers : {})}
                    style={[
                      styles.premiumCardBack,
                      {
                        zIndex: layer.zIndex,
                        opacity: isTopCard ? flyOpacity : layer.opacity,
                        transform: finalTransforms,
                      },
                    ]}
                  >
                    <View style={styles.innerBorder}>
                      <Image
                        source={logo1}
                        style={styles.cardLogo}
                        resizeMode="contain"
                      />
                    </View>
                  </Animated.View>
                );
              })}

              <Animated.View
                style={[
                  styles.countBadge,
                  {
                    transform: [
                      { scale: entryAnim },
                      {
                        translateY: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -3],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.countText}>{remainingCount}</Text>
              </Animated.View>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>החפיסה ריקה!</Text>
              <Text style={styles.emptySub}>
                חזור למסך ההגדרות כדי להתחיל משחק חדש.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* --- חצי תחתון: כפתורים + סטטוס משחק --- */}
      <View style={styles.bottomHalf}>
        <View style={styles.controlsBox}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.drawBtn,
                (remainingCount === 0 || showModal) &&
                  styles.btnDisabled,
              ]}
              onPress={handleDrawPress}
              disabled={remainingCount === 0 || showModal}
            >
              <Text style={styles.btnText}>שלוף קלף</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.backBtn]}
              onPress={() => navigation.navigate('GameHome')}
            >
              <Text style={styles.btnTextDark}>חזרה להגדרות</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.title}>סטטוס משחק</Text>
          <Text style={styles.subTitle}>
            כרטיסים שסיימתם: {revealedCount} / {totalCount}
          </Text>

          {lastCombo ? (
            <View
              style={[
                styles.lastCardBox,
                {
                  borderColor:
                    CAT_COLORS[lastCombo.categoryID] || '#3F51B5',
                },
              ]}
            >
              <Text
                style={[
                  styles.lastCardTitle,
                  {
                    color:
                      CAT_COLORS[lastCombo.categoryID] || '#3F51B5',
                  },
                ]}
              >
                הקלף האחרון ששיחקתם
              </Text>
              <Text style={styles.lastCardText}>
                {categoryName(lastCombo.categoryID)} (
                {heartsByCat[lastCombo.categoryID]}) •{' '}
                {levelName(lastCombo.levelID)} (
                {stars(lastCombo.levelID)})
              </Text>
            </View>
          ) : (
            <Text style={styles.hint}>
              לחצו "שלוף קלף" או משכו את הקלף העליון כדי להתחיל לשחק…
            </Text>
          )}
        </View>
      </View>

      {/* --- מודאל: קלף שנחשף --- */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={skipCard}
      >
        <Pressable style={styles.backdrop} onPress={skipCard}>
          <View
            style={styles.modalCenterWrapper}
            onStartShouldSetResponder={() => true}
          >
            {!!currentCard && (
              <>
                <View style={styles.modalCardWrapper}>
                  <View style={styles.modalCardPhysicalBase}>
                    <View
                      style={[
                        styles.modalCardInnerContent,
                        { backgroundColor: currentTheme.bgColor },
                      ]}
                    >
                      {currentTheme.icon && (
                        <Image
                          source={currentTheme.icon}
                          style={styles.modalCardIconBg}
                          resizeMode="contain"
                        />
                      )}

                      <View style={styles.modalCardHeader}>
                        <Text
                          style={[
                            styles.modalCategoryText,
                            {
                              color:
                                CAT_COLORS[currentCategoryId] || '#333',
                            },
                          ]}
                        >
                          {categoryName(currentCategoryId)}
                        </Text>
                        <Text style={styles.modalLevelText}>
                          {levelName(
                            currentCard.LevelID ?? currentCard.levelID,
                          )}
                        </Text>
                      </View>

                      <View style={styles.cardDivider} />

                      <ScrollView
                        style={styles.modalCardBodyScroll}
                        contentContainerStyle={styles.modalScrollContent}
                        showsVerticalScrollIndicator={false}
                      >
                        <Text style={styles.modalCardBodyText}>
                          {currentCard.cardDescription ??
                            currentCard.CardDescription ??
                            currentCard.description}
                        </Text>
                      </ScrollView>

                      <View style={styles.modalCardFooter}>
                        <Text style={styles.footerIcons}>
                          {heartsByCat[currentCategoryId]}{' '}
                          {stars(
                            currentCard.LevelID ??
                              currentCard.levelID,
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* כפתורי פעולה מתחת לקלף */}
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: '#22C55E' },
                    ]}
                    onPress={finishCard}
                  >
                    <Text style={styles.actionText}>סיימנו ✔</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: '#94A3B8' },
                    ]}
                    onPress={skipCard}
                  >
                    <Text style={styles.actionText}>דלג ▶︎</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: '#3B82F6' },
                    ]}
                    onPress={openFeedbackModal}
                  >
                    <Text style={styles.actionText}>כתוב משוב 📝</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* --- מודאל משוב נפרד --- */}
      <Modal
        visible={feedbackModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFeedbackModal}
      >
        <Pressable style={styles.backdrop} onPress={closeFeedbackModal}>
          <View
            style={styles.feedbackModalWrapper}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.feedbackTitle}>משוב על הקלף</Text>
            <Text style={styles.feedbackSubtitle}>
              כתבו לנו מה חשבתם על הקלף שקיבלתם
            </Text>

            <TextInput
              style={styles.feedbackInput}
              placeholder="כתבו כאן את המשוב…"
              placeholderTextColor="rgba(0,0,0,0.35)"
              multiline
              value={feedbackText}
              onChangeText={setFeedbackText}
              textAlignVertical="top"
            />

            <View style={styles.feedbackButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.feedbackBtn,
                  { backgroundColor: '#9CA3AF' },
                ]}
                onPress={closeFeedbackModal}
                disabled={sendingFeedback}
              >
                <Text style={styles.feedbackBtnText}>ביטול</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.feedbackBtn,
                  { backgroundColor: '#2563EB', opacity: sendingFeedback ? 0.6 : 1 },
                ]}
                onPress={submitFeedback}
                disabled={sendingFeedback}
              >
                <Text style={styles.feedbackBtnText}>
                  {sendingFeedback ? 'שולח…' : 'שלח משוב'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      <View style={styles.footerRow}>
        <LogoutButton
          navigation={navigation}
          style={styles.logoutBtn}
          textStyle={styles.logoutText}
        />
      </View>
    </View>
  );
}

// --- סגנונות ---
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f7fb',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topHalf: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  bottomHalf: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  deckContainer: {
    height: W * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStackWrapper: {
    position: 'relative',
    width: W * 0.65,
    height: W * 0.95,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumCardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#60A5FA',
    padding: 10,
  },
  innerBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardLogo: {
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  countBadge: {
    position: 'absolute',
    bottom: -12,
    right: -12,
    backgroundColor: '#EF4444',
    minWidth: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 15,
    borderWidth: 3,
    borderColor: '#fff',
  },
  countText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    maxWidth: W * 0.85,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    color: '#111827',
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  controlsBox: {
    width: W,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  btnTextDark: {
    color: '#1F2937',
    fontWeight: '800',
    fontSize: 15,
  },
  drawBtn: {
    backgroundColor: '#2563EB',
    elevation: 4,
  },
  backBtn: {
    backgroundColor: '#F3F4F6',
  },
  btnDisabled: {
    opacity: 0.5,
    elevation: 0,
  },
  statusBox: {
    width: W,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  subTitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  hint: {
    marginTop: 10,
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  lastCardBox: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    borderLeftWidth: 5,
  },
  lastCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  lastCardText: {
    fontSize: 15,
    color: '#334155',
  },

  // מודאלים
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
  },
  modalCenterWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCardWrapper: {
    width: '90%',
    maxWidth: 360,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalCardPhysicalBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalCardInnerContent: {
    width: '100%',
    minHeight: W * 0.85,
    maxHeight: W * 1.2,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  modalCardIconBg: {
    position: 'absolute',
    width: 250,
    height: 250,
    bottom: -30,
    right: -30,
    opacity: 0.25,
    transform: [{ rotate: '-15deg' }],
  },
  modalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCategoryText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modalLevelText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.6)',
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 16,
    width: '100%',
  },
  modalCardBodyScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 20,
    justifyContent: 'center',
    minHeight: 100,
  },
  modalCardBodyText: {
    fontSize: 22,
    lineHeight: 32,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  modalCardFooter: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerIcons: {
    fontSize: 16,
    opacity: 0.9,
  },
  modalActionsRow: {
    width: '90%',
    maxWidth: 360,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  // מודאל המשוב
  feedbackModalWrapper: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
    color: '#111827',
  },
  feedbackSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  feedbackInput: {
    minHeight: 90,
    maxHeight: 140,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(249,250,251,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    fontSize: 14,
    color: '#111827',
  },
  feedbackButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 14,
  },
  feedbackBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  footerRow: {
    width: W,
    marginVertical: 16,
  },
  logoutBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
  },
});
