// comp/common/TopMenu.jsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

const { width } = Dimensions.get('window');

const LIGHT_SCREENS = [
  'FamilyCardsSelect',
  'FriendsCardsSelect',
  'GameHome',
  'IndexGame',
  'FeedbackScreen',
  'Contact',
  'Help'
];

export default function TopMenu({ navigation, theme }) {
  const [open, setOpen] = useState(false);

  const route = useRoute();
  const currentScreenName = route.name;

  const isLightMode = theme
    ? theme === 'light'
    : LIGHT_SCREENS.includes(currentScreenName);

  const iconColor = isLightMode ? '#334155' : '#ffffff';

  const btnGradient = isLightMode
    ? ['#ffffff', '#f1f5f9']
    : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'];

  const borderColor = isLightMode ? '#cbd5e1' : 'rgba(255,255,255,0.3)';
  const containerStyle = isLightMode ? styles.lightShadow : {};

  const go = (screenName, params = {}) => {
    setOpen(false);
    setTimeout(() => {
      if (navigation) {
        navigation.navigate(screenName, params);
      }
    }, 100);
  };

  // ✅ התנתקות אמיתית: מוחק lg_user ומחזיר ל-Welcome
  // comp/Settings/TopMenu.jsx (או איפה שהוא אצלך)

  const handleLogout = async () => {
    try {
      setOpen(false);

      // ✅ זה המפתח שהאפליקציה בודקת ב-App.js
      await SecureStore.deleteItemAsync('lg_user');

      // אופציונלי: לנקות גם את אישור הגיל 18
      await SecureStore.deleteItemAsync('lg_isAdult18');

      // ✅ איפוס הניווט – חוזר למסך Welcome בלי אפשרות Back
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (err) {
      console.log('Logout error:', err);
      Alert.alert('שגיאה', 'אירעה תקלה בעת ההתנתקות, נסה שוב.');
    }
  };


  return (
    <>
      <View style={styles.triggerContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setOpen(true)}
          style={[styles.menuBtnWrapper, containerStyle]}
        >
          <LinearGradient
            colors={btnGradient}
            style={[styles.menuBtn, { borderColor: borderColor }]}
          >
            <MaterialCommunityIcons name="menu" size={28} color={iconColor} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={styles.menuBox}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={styles.headerTitle}>תפריט</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <MenuItem
              title="בחירת מצב משחק"
              icon="gamepad-variant"
              onPress={() => go('GameModeSelect')}
            />
            <MenuItem
              title="קלפים לזוגות"
              icon="cards-heart"
              onPress={() => go('GameHome', { gameMode: 'couple' })}
            />
            <MenuItem
              title="קלפים למשפחה"
              icon="home-heart"
              onPress={() => go('FamilyCardsSelect')}
            />
            <MenuItem
              title="קלפים לחברים"
              icon="account-group"
              onPress={() => go('FriendsCardsSelect')}
            />

            <View style={styles.divider} />

            <MenuItem
              title="פידבק"
              icon="message-draw"
              onPress={() => go('FeedbackScreen')}
            />
            <MenuItem
              title="צור קשר"
              icon="email-outline"
              onPress={() => go('Contact')}
            />
            <MenuItem
              title="עזרה"
              icon="help-circle-outline"
              onPress={() => go('Help')}
            />

            <View style={styles.divider} />

            {/* 🔴 התנתקות – רק כאן בתפריט */}
            <MenuItem
              title="התנתקות"
              icon="logout"
              isDanger
              onPress={handleLogout}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const MenuItem = ({ title, icon, onPress, isDanger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.itemContent}>
      <Text style={[styles.itemText, isDanger && styles.dangerText]}>
        {title}
      </Text>
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={isDanger ? '#ff4b4b' : '#e2e8f0'}
      />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  triggerContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
  },
  menuBtnWrapper: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  lightShadow: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: '#fff',
    borderRadius: 25,
  },
  menuBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 22,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 15,
  },
  menuBox: {
    width: width * 0.7,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    elevation: 10,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 12,
  },
  menuItem: {
    paddingVertical: 12,
  },
  itemContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    color: '#e2e8f0',
    fontSize: 16,
  },
  dangerText: {
    color: '#ff4b4b',
    fontWeight: 'bold',
  },
});
