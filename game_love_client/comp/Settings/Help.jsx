// comp/Help/HelpScreen.jsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TopMenu from '../Settings/TopMenu';

const { width } = Dimensions.get('window');

export default function HelpScreen({ navigation }) {
  
  const goToGameModes = () => {
    navigation.navigate('GameModeSelect');
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#020617']}
      style={styles.container}
    >
      {/* תפריט עליון */}
      <TopMenu navigation={navigation} />

      <View style={styles.contentWrapper}>
        
        {/* כותרת ראשית */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="help-circle-outline" size={40} color="#3b82f6" />
          <Text style={styles.title}>מרכז העזרה</Text>
          <Text style={styles.subtitle}>
            כל המידע שצריך כדי להתחיל לשחק וליהנות
          </Text>
        </View>

        <View style={styles.card}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* מה זה Liba */}
            <Section 
              title="מה עושים באפליקציה?" 
              icon="cards-playing-outline"
            >
              Liba היא אפליקציית קלפים לחיזוק קשרים – לזוגות, משפחות וחברים. בוחרים חפיסת קלפים ורמת קושי, ובכל תור שולפים קלף עם שאלה או משימה שמייצרת שיחה, צחוק ורגעים של קרבה.
            </Section>

            {/* איך מתחילים */}
            <Section 
              title="איך מתחילים לשחק?" 
              icon="play-circle-outline"
            >
              1. במסך הראשי לחצו על "בחירת מצב משחק" ובחרו: זוגות, משפחה או חברים.{'\n'}
              2. במסכי ההגדרות בחרו קטגוריות (היכרות, כיף, תשוקה / גיבוש) ורמות קושי (1–3 כוכבים).{'\n'}
              3. אשרו את הבחירה והיכנסו למסך המשחק.
            </Section>

            {/* איך נראה תור */}
            <Section 
              title="איך נראה תור במשחק?" 
              icon="timer-outline"
            >
              • לחצו על "שלוף קלף" כדי לקבל משימה.{'\n'}
              • בראש הקלף מופיעים סוג הקלף ורמת הקושי.{'\n'}
              • למטה יש טיימר למדידת זמן (אופציונלי).{'\n'}
              • בסיום, לחצו "סיימנו" כדי לעבור הלאה, או "דלג" אם הקלף לא מתאים.
            </Section>

            {/* פידבק */}
            <Section 
              title="יש לכם רעיון לשיפור?" 
              icon="message-draw"
            >
              נשמח לשמוע!{'\n'}
              אפשר לשלוח משוב ספציפי על כל קלף בתוך המשחק, או משוב כללי דרך התפריט הראשי במסך "פידבק".
            </Section>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* כפתורים למטה */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryText}>חזרה</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={goToGameModes}
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                style={styles.gradientBtn}
              >
                <Text style={styles.primaryText}>למשחק</Text>
                <MaterialCommunityIcons name="arrow-left" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

// קומפוננטת עזר לפסקה
const Section = ({ title, icon, children }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      {/* שים לב: הסדר כאן משנה אם אנחנו לא משתמשים ב-row-reverse */}
      <Text style={styles.sectionTitle}>{title}</Text>
      <MaterialCommunityIcons name={icon} size={20} color="#60a5fa" />
    </View>
    <Text style={styles.paragraph}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingTop: 85,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#f8fafc',
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 4, 
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionContainer: {
    marginBottom: 24,
    alignItems: 'center', // ✅ ממקם את כל הבלוק במרכז
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // ✅ ממרכז את הכותרת והאייקון אופקית
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '700',
    textAlign: 'center', // ✅ ממרכז את הטקסט של הכותרת
  },
  paragraph: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
    textAlign: 'center', // ✅ ממרכז את תוכן הפסקה
    width: '100%',
  },
  buttonsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  primaryButton: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#475569',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  secondaryText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
});