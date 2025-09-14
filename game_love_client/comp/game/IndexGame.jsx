import React, { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, Modal, Pressable, ScrollView,
} from 'react-native';
import { LogoutButton } from '../Settings/Settings';
// 🚨 שמירת שם הייבוא המקורי (שם הקובץ לא משנה אם הייבוא זהה)
import SideWheel3D from '../../comp/Settings/SideWheel3D'; 

const W = Math.min(520, Math.max(320, Math.round(Dimensions.get('window').width - 40)));

const CAT_COLORS = { 1: '#1976D2', 2: '#009688', 3: '#E91E63' };
const categoryName = (id) => (id === 1 ? 'היכרות' : id === 2 ? 'כיף' : 'תשוקה');
const levelName = (id) => (id === 1 ? 'קל' : id === 2 ? 'בינוני' : 'קשה');
const heartsByCat = { 1: '💙', 2: '💙💙', 3: '💙💙💙' };
const stars = (n) => '⭐'.repeat(Math.max(1, Math.min(3, n)));

export default function IndexGame({ route, navigation }) {
  const { cards = [] } = route?.params || {};

  // 🚨 slices מכיל עכשיו את רשימת הכרטיסים המלאה
  const slices = useMemo(() => {
    return cards;
  }, [cards]);

  // מפה לפי ID
  const mapById = useMemo(() => {
    const m = new Map();
    for (const c of cards) {
      const id = c.cardID ?? c.CardID ?? c.id;
      m.set(id, c);
    }
    return m;
  }, [cards]);

  const [remaining, setRemaining] = useState(() => new Set(cards.map((c) => c.cardID ?? c.CardID ?? c.id)));

  // סטייט משחק
  const [spinning, setSpinning] = useState(false);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'spinning' | 'stopped' | 'modal'
  const [lastCombo, setLastCombo] = useState(null); 
  const [lastRevealedCardId, setLastRevealedCardId] = useState(null);
  const [revealedCount, setRevealedCount] = useState(0);

  // מודאל קלף
  const [showModal, setShowModal] = useState(false);
  const [card, setCard] = useState(null);

  const startSpin = () => {
    if (spinning || !slices.length) return;
    setPhase('spinning');
    setSpinning(true);
    setLastCombo(null);
    setLastRevealedCardId(null);
    // 🚨 שימוש בשם המקורי של הפונקציה (requestSpin)
    SideWheel3D.requestSpin?.(); 
  };

  // 🚨 הפונקציה onWheelStop מקבלת עכשיו את אינדקס הכרטיס שנעצר
  const onWheelStop = (index) => {
    const chosenCard = slices[index]; 
    if (!chosenCard) { setPhase('idle'); return; }
    
    // מעדכנים את הסטטוס עם פרטי הכרטיס שנבחר
    setLastCombo({
        categoryID: chosenCard.CategoryID ?? chosenCard.categoryID,
        levelID: chosenCard.LevelID ?? chosenCard.levelID,
        cardId: chosenCard.cardID ?? chosenCard.CardID ?? chosenCard.id,
    });
    setPhase('stopped');
  };

  // חשיפת קלף
  const revealCard = () => {
    if (phase !== 'stopped' || !lastCombo?.cardId) return;

    let chosenId = lastRevealedCardId;
    if (!chosenId) {
      chosenId = lastCombo.cardId;
      setLastRevealedCardId(chosenId);
      
      if (!remaining.has(chosenId)) {
        Alert.alert('קלף שחוק', 'הקלף הזה כבר שוחק בסבב הנוכחי. סובבו שוב.');
        setPhase('idle'); 
        return;
      }
    }

    const chosen = mapById.get(chosenId);
    if (!chosen) return;

    setCard(chosen);
    setShowModal(true);
    setPhase('modal');
  };

  const finishCard = () => {
    if (card) {
      const id = card.cardID ?? card.CardID ?? card.id;
      setRemaining((prev) => {
        const n = new Set(prev); n.delete(id); return n;
      });
      setRevealedCount((n) => n + 1);
    }
    setCard(null);
    setShowModal(false);
    setPhase('stopped');
  };

  const skipCard = () => {
    setCard(null);
    setShowModal(false);
    setPhase('stopped');
  };

  return (
    <View style={styles.screen}>
      {/* 🚨 עליון: שימוש בשם המקורי של הקומפוננטה */}
      <View style={styles.topHalf}>
        <SideWheel3D
          slices={slices}
          spinning={spinning}
          setSpinning={setSpinning}
          onStop={onWheelStop}
        />
      </View>

      {/* תחתון: כפתורים + סטטוס */}
      <View style={styles.bottomHalf}>
        <View style={styles.controlsBox}>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.btn, styles.spinBtn, (spinning || !slices.length) && styles.btnDisabled]}
              onPress={startSpin}
              disabled={spinning || !slices.length}
            >
              <Text style={styles.btnText}>סובב רולטה</Text>
            </TouchableOpacity>

            {phase === 'stopped' && (
              <TouchableOpacity style={[styles.btn, styles.revealBtn]} onPress={revealCard}>
                <Text style={styles.btnText}>חשוף קלף</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.btn, styles.backBtn]} onPress={() => navigation.navigate('GameHome')}>
              <Text style={styles.btnTextDark}>חזרה להגדרות</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusBox}>
          <Text style={styles.title}>משחק הכרטיסים</Text>
          <Text style={styles.subTitle}>כרטיס {revealedCount} / {cards.length}</Text>

          {lastCombo ? (
            <View style={[styles.lastCardBox, { borderColor: CAT_COLORS[lastCombo.categoryID] || '#3F51B5' }]}>
              <Text style={[styles.lastCardTitle, { color: CAT_COLORS[lastCombo.categoryID] || '#3F51B5' }]}>הגרלה אחרונה</Text>
              <Text style={styles.lastCardText}>
                {categoryName(lastCombo.categoryID)} ({heartsByCat[lastCombo.categoryID]}) • {levelName(lastCombo.levelID)} ({stars(lastCombo.levelID)})
              </Text>
            </View>
          ) : (
            <Text style={styles.hint}>סובבו כדי לראות מה מתקרב…</Text>
          )}
        </View>
      </View>

      {/* מודאל חשיפת קלף אמיתי מהמסד */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={skipCard}>
        <Pressable style={styles.backdrop} onPress={skipCard}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            {!!card && (
              <>
                <View style={styles.sheetHeader}>
                  <View style={[styles.pill, { backgroundColor: '#eef2f7' }]}>
                    <Text style={[styles.pillText, { color: CAT_COLORS[card.CategoryID ?? card.categoryID] || '#3F51B5' }]}>
                      {categoryName(card.CategoryID ?? card.categoryID)} • {levelName(card.LevelID ?? card.levelID)}
                    </Text>
                  </View>
                  <View style={styles.kudos}>
                    <Text>{heartsByCat[card.CategoryID ?? card.categoryID]} {stars(card.LevelID ?? card.levelID)}</Text>
                  </View>
                </View>

                <ScrollView style={{ maxHeight: 260 }}>
                  <Text style={styles.sheetBody}>{card.cardDescription ?? card.CardDescription ?? card.description}</Text>
                </ScrollView>

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#22C55E' }]} onPress={finishCard}>
                    <Text style={styles.actionText}>סיימנו ✔</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#9e9e9e' }]} onPress={skipCard}>
                    <Text style={styles.actionText}>דלג ▶︎</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Pressable>
      </Modal>

      <View style={styles.footerRow}>
        <LogoutButton navigation={navigation} style={styles.logoutBtn} textStyle={styles.logoutText} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f7fb', alignItems: 'center', justifyContent: 'space-between' },
  topHalf: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingTop: 12 },
  bottomHalf: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 16 },
  controlsBox: { width: W, backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e7e7ee', padding: 12, marginBottom: 10 },
  controlsRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' },
  btn: { flexGrow: 1, flexBasis: 140, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '800' },
  btnTextDark: { color: '#111827', fontWeight: '800' },
  spinBtn: { backgroundColor: '#2979FF' },
  revealBtn: { backgroundColor: '#2E7D32' },
  backBtn: { backgroundColor: '#e5e7eb' },
  btnDisabled: { opacity: 0.6 },
  statusBox: { width: W, backgroundColor: '#ffffff', borderRadius: 14, borderWidth: 1, borderColor: '#e7e7ee', padding: 12 },
  title: { fontSize: 18, fontWeight: '800' },
  subTitle: { marginTop: 4, color: '#6b7280' },
  hint: { marginTop: 6, fontSize: 12, color: '#9CA3AF' },
  lastCardBox: { marginTop: 10, backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 2, padding: 10 },
  lastCardTitle: { fontSize: 14, fontWeight: '800' },
  lastCardText: { marginTop: 4, fontSize: 15, color: '#111827' },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 18, borderTopRightRadius: 18, gap: 10 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  pillText: { fontSize: 12, fontWeight: '700' },
  kudos: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10, backgroundColor: '#f2f2f2' },
  sheetBody: { fontSize: 16, lineHeight: 22 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#fff', fontWeight: '800' },
  footerRow: { width: W, marginVertical: 12 },
  logoutBtn: { backgroundColor: '#ef5350', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700' },
});