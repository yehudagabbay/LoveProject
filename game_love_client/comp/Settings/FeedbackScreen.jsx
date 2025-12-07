// comp/Feedback/FeedbackScreen.jsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import TopMenu from '../Settings/TopMenu';

// ✅ כתובת ה־API האמיתית של הפידבק
const FEEDBACK_ENDPOINT = 'http://lovegame.somee.com/api/Users/submit-feedback';

// ✅ הכרטיס הכללי שיצרת בטבלה: CardID = 300
const GENERAL_FEEDBACK_CARD_ID = 300;

export default function FeedbackScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(false);

  // טוען את המשתמש השמור (lg_user) כדי להוציא ממנו UserID
  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync('lg_user');
        if (!raw) return;

        const parsed = JSON.parse(raw);

        // להתאים לשם השדה שאתה שומר
        const idFromStorage =
          parsed?.userId ||
          parsed?.UserId ||
          parsed?.userID ||
          parsed?.UserID ||
          parsed?.id ||
          parsed?.Id ||
          null;

        if (idFromStorage) {
          setUserId(idFromStorage);
        } else {
          console.log('לא נמצא userId בתוך lg_user:', parsed);
        }
      } catch (e) {
        console.log('שגיאה בקריאת lg_user מה־SecureStore:', e);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert(
        'חסר משתמש',
        'לא הצלחנו לזהות את המשתמש. התחבר מחדש ונסה שוב.'
      );
      return;
    }

    if (!feedbackText.trim()) {
      Alert.alert('פידבק ריק', 'נא לכתוב משהו לפני השליחה.');
      return;
    }

    setLoading(true);

    try {
      // 👇 זה המבנה ש*כבר עובד* בעמוד המשחק, רק עם CardID = 300
      const payload = {
        UserID: userId,                    // כמו במשחק
        CardID: GENERAL_FEEDBACK_CARD_ID,  // 300 – כרטיס פידבק כללי
        Rating: 3,                         // דירוג נייטרלי (1–5)
        Comment: feedbackText.trim(),
      };

      console.log('Sending feedback to:', FEEDBACK_ENDPOINT, payload);

      const res = await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        console.log('Feedback error:', res.status, errorText);
        throw new Error('Feedback request failed');
      }

      Alert.alert('תודה רבה! 💙', 'הפידבק שלך נקלט בהצלחה.', [
        {
          text: 'חזרה',
          onPress: () => navigation.goBack(),
        },
      ]);

      setFeedbackText('');
    } catch (err) {
      console.log('Error submitting feedback:', err);
      Alert.alert(
        'שגיאה בשליחה',
        'משהו השתבש בזמן שליחת הפידבק. נסה שוב מאוחר יותר.'
      );
    } finally {
      setLoading(false);
    }
  };
  const handleOpenEmail = () => {
    const email = 'liba.supp@gmail.com';
    const subject = encodeURIComponent('פידבק על אפליקציית Liba');
    const body = encodeURIComponent('');
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    Linking.openURL(url).catch((err) =>
      console.log('Error opening email app:', err)
    );
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#020617']}
      style={styles.container}
    >
      {/* תפריט עליון */}
      <TopMenu navigation={navigation} />

      <View style={styles.card}>
        <Text style={styles.title}>פידבק על האפליקציה</Text>
        <Text style={styles.subtitle}>
          ספר לנו מה אהבת, מה פחות, ואם יש לך רעיון לשיפור המשחק 🙂
        </Text>

        <TextInput
          style={styles.input}
          placeholder="כתוב כאן את הפידבק שלך..."
          placeholderTextColor="rgba(148, 163, 184, 0.9)"
          value={feedbackText}
          onChangeText={setFeedbackText}
          multiline
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>שלח פידבק</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>ביטול</Text>
        </TouchableOpacity>

        <View style={styles.emailBox}>
          <Text style={styles.emailText}>
            אפשר גם לכתוב לנו למייל:
          </Text>
          <TouchableOpacity onPress={handleOpenEmail}>
            <Text style={styles.emailLink}>liba.supp@gmail.com</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderRadius: 20,
    padding: 16,
    paddingTop: 80, // קצת מקום מתחת לתפריט
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    color: '#e5e7eb',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    minHeight: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(55, 65, 81, 0.9)',
    padding: 10,
    color: '#e5e7eb',
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  submitButton: {
    backgroundColor: '#10b981',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  cancelText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  emailBox: {
    marginTop: 16,
    alignItems: 'center',
  },
  emailText: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 4,
  },
  emailLink: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
