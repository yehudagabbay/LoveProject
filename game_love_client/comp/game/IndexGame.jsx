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
  TextInput,
} from 'react-native';
import { LogoutButton } from '../Settings/Settings';
import logo1 from '../../assets/images/logo1.png';

// אייקונים
import iconLove from '../../assets/images/icons/love.png';
import iconFun from '../../assets/images/icons/fun.png';
import iconRelations from '../../assets/images/icons/relations.png';

// ⏱ טיימר
import { GameTimer } from '../Settings/GameTimer';

// --- חישוב רוחב וגובה מסך ---
const W = Math.min(
  520,
  Math.max(320, Math.round(Dimensions.get('window').width - 40)),
);

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ================== כתובת API למשוב ==================
const FEEDBACK_URL = 'http://lovegame.somee.com/api/Users/submit-feedback';

const getCurrentUserId = (route) =>
  route?.params?.userId ??
  route?.params?.user?.UserID ??
  0;

// --- קבועים ועזרים ---
const CAT_COLORS = { 1: '#1976D2', 2: '#009688', 3: '#E91E63' };
const categoryName = (id) =>
  id === 1 ? 'היכרות' : id === 2 ? 'כיף' : 'תשוקה';
const levelName = (id) =>
  id === 1 ? 'קל' : id === 2 ? 'בינוני' : 'קשה';
const heartsByCat = { 1: '💙', 2: '💙💙', 3: '💙💙💙' };
const stars = (n) => '⭐'.repeat(Math.max(1, Math.min(3, n)));

const CATEGORY_THEME = {
  1: { name: 'Relations', bgColor: '#FDB4A4', icon: iconRelations },
  2: { name: 'Fun', bgColor: '#FBB6E1', icon: iconFun },
  3: { name: 'Love', bgColor: '#FCD29F', icon: iconLove },
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
  const { cards = [], players: routePlayers = [] } = route?.params || {};

  // שמות השחקנים – לזוגות יש ברירת מחדל אם לא הוזן
  const players = useMemo(() => {
    if (
      Array.isArray(routePlayers) &&
      routePlayers.filter((p) => p && p.trim().length > 0).length >= 2
    ) {
      return routePlayers.filter((p) => p && p.trim().length > 0);
    }
    return ['שחקן 1', 'שחקן 2'];
  }, [routePlayers]);

  // תור השחקן הנוכחי
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

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

  // --- לוגיקה של קלפים --- //
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

  // משוב
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const remainingCount = remaining.size;
  const totalCount = cards.length;

  const advanceTurn = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
  };

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
        'שיחקתם בכל הקלפים. חזרו למסך ההגדרות כדי להתחיל משחק חדש.',
        [
          {
            text: 'להגדרות',
            onPress: () =>
              navigation.navigate('GameHome'),
          },
          { text: 'סגור', style: 'cancel' },
        ],
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
    advanceTurn();
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
    advanceTurn();
    setCurrentCardId(null);
    closeCardModal();
  };

  const openFeedbackModal = () => {
    if (!currentCardId) return;
    const userId = getCurrentUserId(route);
    if (!userId || userId <= 0) {
      Alert.alert('שגיאה', 'לא נמצא משתמש מחובר לשליחת משוב.');
      return;
    }
    setFeedbackText('');
    setFeedbackModalVisible(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalVisible(false);
    setFeedbackText('');
  };

  const submitFeedback = async () => {
    if (!currentCardId) return;
    const card = mapById.get(currentCardId);
    if (!card) return;
    const userId = getCurrentUserId(route);
    if (!userId || userId <= 0) {
      Alert.alert('שגיאה', 'לא נמצא משתמש מחובר.');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Status not OK');
      Alert.alert('תודה!', 'המשוב נשלח בהצלחה.');
      closeFeedbackModal();
    } catch (err) {
      Alert.alert('שגיאה', 'לא ניתן היה לשלוח את המשוב כרגע.');
    } finally {
      setSendingFeedback(false);
    }
  };

  const currentCard =
    currentCardId != null ? mapById.get(currentCardId) : null;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !showModal && remainingCount > 0,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
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
    rawCategoryId !== null ? Number(rawCategoryId) : null;
  const currentTheme =
    (currentCategoryId && CATEGORY_THEME[currentCategoryId]) ||
    DEFAULT_THEME;

  return (
    <View style={styles.screen}>
      {/* כותרת עליונה */}
      <View style={styles.header}>
        <Text style={styles.gameTitle}>משחק זוגות</Text>
        <Text style={styles.gameSubTitle}>
          זמן איכות זוגי סביב שאלות ומשימות ♥️
        </Text>
      </View>

      {/* חצי עליון: חפיסת הקלפים */}
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
                  ? [...baseTransforms, { translateX: pan.x }, { translateY: pan.y }]
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
                חזרו להגדרות כדי להתחיל משחק חדש.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* חצי תחתון */}
      <View style={styles.bottomHalf}>
        {/* כפתורי שליפה / הגדרות */}
        <View style={styles.controlsBox}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.drawBtn,
                (remainingCount === 0 || showModal) && styles.btnDisabled,
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
              <Text style={styles.btnTextDark}>הגדרות</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.title}>סטטוס משחק</Text>
          <Text style={styles.subTitle}>
            כרטיסים שסיימתם: {revealedCount} / {totalCount}
          </Text>

          {/* תור השחקן */}
          <View style={styles.playerTurnBadge}>
            <Text style={styles.playerTurnLabel}>עכשיו תור:</Text>
            <Text style={styles.playerTurnName}>
              {players[currentPlayerIndex]}
            </Text>
          </View>

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

      {/* --- מודאל קלף --- */}
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
                                CAT_COLORS[currentCategoryId] ||
                                '#333',
                            },
                          ]}
                        >
                          {categoryName(currentCategoryId)}
                        </Text>
                        <Text style={styles.modalLevelText}>
                          {levelName(
                            currentCard.LevelID ??
                              currentCard.levelID,
                          )}
                        </Text>
                      </View>

                      <Text style={styles.turnBadge}>
                        התור של: {players[currentPlayerIndex]}
                      </Text>

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

                      {/* ⏱ טיימר – מתאפס לכל קלף חדש */}
                      <GameTimer
                        key={currentCardId}
                        mode="timer"
                        defaultTime={60}
                      />

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

                {/* כפתורי פעולה */}
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
                    <Text style={styles.actionText}>משוב 📝</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* --- מודאל משוב --- */}
      <Modal
        visible={feedbackModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeFeedbackModal}
      >
        <Pressable
          style={styles.backdrop}
          onPress={closeFeedbackModal}
        >
          <View
            style={styles.feedbackModalWrapper}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.feedbackTitle}>משוב על הקלף</Text>
            <Text style={styles.feedbackSubtitle}>
              כתבו לנו מה חשבתם על הקלף שקיבלתם
            </Text>

            <ScrollView>
              <Text
                style={{
                  fontSize: 14,
                  color: '#6B7280',
                  marginBottom: 8,
                  textAlign: 'right',
                }}
              >
                המשוב עוזר לנו לשפר את המשחק ולהוסיף משימות שמתאימות
                לזוגות כמוכם.
              </Text>
            </ScrollView>

            <View style={{ marginTop: 10 }}>
              <TextInput
                style={styles.feedbackInput}
                placeholder="כתבו כאן את המשוב…"
                placeholderTextColor="rgba(0,0,0,0.35)"
                multiline
                value={feedbackText}
                onChangeText={setFeedbackText}
                textAlignVertical="top"
              />
            </View>

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
                  {
                    backgroundColor: '#2563EB',
                    opacity: sendingFeedback ? 0.6 : 1,
                  },
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

// ==============================================
// ================= עיצוב ======================
// ==============================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  gameSubTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  topHalf: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  bottomHalf: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  deckContainer: {
    height: W * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
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
    borderRadius: 24,
    backgroundColor: '#2c3e50',
    borderWidth: 2,
    borderColor: '#E91E63',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  innerBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34495e',
    overflow: 'hidden',
  },
  cardLogo: {
    width: '80%',
    height: '80%',
    opacity: 0.9,
  },
  countBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#FF4081',
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#fff',
  },
  countText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyBox: {
    padding: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySub: {
    fontSize: 15,
    color: '#666',
    marginTop: 5,
  },
  controlsBox: {
    width: W,
    marginBottom: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'space-between',
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  btnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 1,
  },
  btnTextDark: {
    color: '#555',
    fontWeight: '700',
    fontSize: 15,
  },
  drawBtn: {
    backgroundColor: '#FF4081',
    flex: 1.5,
  },
  backBtn: {
    backgroundColor: '#fff',
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
  },
  btnDisabled: {
    opacity: 0.6,
    backgroundColor: '#ccc',
  },
  statusBox: {
    width: W,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  playerTurnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  playerTurnLabel: {
    fontSize: 14,
    color: '#555',
    marginRight: 6,
  },
  playerTurnName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  hint: {
    marginTop: 10,
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  lastCardBox: {
    marginTop: 5,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  lastCardTitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  lastCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.85)',
  },
  modalCenterWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCardWrapper: {
    width: '85%',
    maxWidth: 340,
  },
  modalCardPhysicalBase: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 10,
    elevation: 25,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  modalCardInnerContent: {
    width: '100%',
    minHeight: SCREEN_HEIGHT * 0.75,
    maxHeight: SCREEN_HEIGHT * 0.88,
    borderRadius: 22,
    padding: 25,
    justifyContent: 'space-between',
  },
  modalCardIconBg: {
    position: 'absolute',
    width: 200,
    height: 200,
    bottom: -20,
    right: -20,
    opacity: 0.15,
  },
  modalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalCategoryText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333',
    letterSpacing: 1,
  },
  modalLevelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  turnBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    overflow: 'hidden',
  },
  cardDivider: {
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 20,
    width: '40%',
    alignSelf: 'center',
  },
  modalCardBodyScroll: {
    flex: 1,
    maxHeight: SCREEN_HEIGHT * 0.45,
  },
  modalScrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCardBodyText: {
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  modalCardFooter: {
    marginTop: 10,
    alignItems: 'center',
  },
  footerIcons: {
    fontSize: 18,
  },
  modalActionsRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  feedbackModalWrapper: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  feedbackSubtitle: {
    textAlign: 'center',
    color: '#777',
    marginBottom: 20,
  },
  feedbackInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    padding: 15,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  feedbackButtonsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  feedbackBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  feedbackBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footerRow: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
  },
  logoutBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#ff6b6b',
    fontWeight: '600',
  },
});
