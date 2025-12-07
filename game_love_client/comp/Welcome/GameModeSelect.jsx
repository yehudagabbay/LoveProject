import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';

import * as SecureStore from 'expo-secure-store';

// ייבוא הקומפוננטות שלך
import AgeGate from '../Settings/AgeGate';
import TopMenu from '../Settings/TopMenu';
import AnimatedLogo from '../Settings/AnimatedLogo';

const { width, height } = Dimensions.get('window');

// ======================================================
// 🔥 קומפוננטה: סלוגן מדורג - גרסה סימטרית מתוקנת
// ======================================================
const SloganAnimation = () => {
  const opacity1 = useRef(new Animated.Value(0)).current;
  const opacity2 = useRef(new Animated.Value(0)).current;
  const opacity3 = useRef(new Animated.Value(0)).current;

  const transY1 = useRef(new Animated.Value(20)).current;
  const transY2 = useRef(new Animated.Value(20)).current;
  const transY3 = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    startLoop();
  }, []);

  const startLoop = () => {
    opacity1.setValue(0); transY1.setValue(20);
    opacity2.setValue(0); transY2.setValue(20);
    opacity3.setValue(0); transY3.setValue(20);

    const animateIn = (op, tr) => Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.back(1.5)) }),
      Animated.timing(tr, { toValue: 0, duration: 800, useNativeDriver: true, easing: Easing.out(Easing.back(1.5)) }),
    ]);

    const animateOut = (op) => Animated.timing(op, {
      toValue: 0, duration: 1000, useNativeDriver: true,
    });

    Animated.sequence([
      Animated.stagger(600, [
        animateIn(opacity1, transY1),
        animateIn(opacity2, transY2),
        animateIn(opacity3, transY3),
      ]),
      Animated.delay(2500),
      Animated.parallel([
        animateOut(opacity1), animateOut(opacity2), animateOut(opacity3),
      ]),
      Animated.delay(500),
    ]).start(({ finished }) => {
      if (finished) startLoop();
    });
  };

  const lineStyle = {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    textAlign: 'center',
  };

  const OFFSET = 70;

  return (
    <View style={styles.sloganContainer}>
      <Animated.View style={{
        opacity: opacity1,
        alignSelf: 'center',
        transform: [{ translateY: transY1 }, { translateX: OFFSET }],
      }}>
        <Text style={lineStyle}>לשחק.</Text>
      </Animated.View>

      <Animated.View style={{
        opacity: opacity2,
        alignSelf: 'center',
        transform: [{ translateY: transY2 }],
      }}>
        <Text style={lineStyle}>לגלות.</Text>
      </Animated.View>

      <Animated.View style={{
        opacity: opacity3,
        alignSelf: 'center',
        transform: [{ translateY: transY3 }, { translateX: -OFFSET }],
      }}>
        <Text style={[lineStyle, { color: '#ff6b81' }]}>להתאהב מחדש.</Text>
      </Animated.View>
    </View>
  );
};

// ======================================================
// רקע וידאו
// ======================================================
// ======================================================
// רקע וידאו - עם expo-video
// ======================================================
const bgSource = require('../../assets/images/game_mode_select_bg2.mp4');

const LiveBackground = () => {
  const player = useVideoPlayer(bgSource, (playerInstance) => {
    // הפעלה אוטומטית, לולאה ומיוט
    playerInstance.loop = true;
    playerInstance.muted = true;
    playerInstance.play();
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* שכבת צבע בסיסית מתחת לוידאו */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: '#0f172a' },
        ]}
      />

      {/* הוידאו עצמו */}
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="cover"              // כמו resizeMode="cover"
        allowsFullscreen={false}
        allowsPictureInPicture={false}
      />

      {/* שכבת כהה מעל הוידאו */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: 'rgba(15, 23, 42, 0.45)' },
        ]}
      />
    </View>
  );
};


// ======================================================
// כרטיס מצב משחק
// ======================================================
const ModeCard = ({
  title,
  subtitle,
  icon,
  colors,
  onPress,
  delay,
  customStyle,
  iconStyle,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        styles.cardWrapper,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[styles.cardContainer, customStyle]}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardGradient, customStyle]}
        >
          <View style={[styles.contentRow, iconStyle]}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name={icon} size={28} color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ======================================================
// המסך הראשי
// ======================================================
export default function GameModeSelect({ navigation, route }) {
  const userId = route?.params?.userId ?? null;
  const user = route?.params?.user ?? null;

  const [showAgeGate, setShowAgeGate] = useState(false);
  const [isAdult, setIsAdult] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const val = await SecureStore.getItemAsync('lg_isAdult18');
        if (val === 'true') {
          setIsAdult(true);
        }
      } catch (e) { }
    })();
  }, []);

  const handleChooseMode = (mode) => {
    const params = { userId, user, gameMode: mode };

    if (mode === 'couple') {
      if (isAdult) {
        return navigation.navigate('GameHome', params);
      }
      setShowAgeGate(true);
      return;
    }

    if (mode === 'family') {
      return navigation.navigate('FamilyCardsSelect', {
        gameMode: 'family',
        userId,
        user,
      });
    }

    // מצב עבודה (הישן)
    if (mode === 'work') {
      return navigation.navigate('FriendsCardsSelect', {
        ...params,
        gameMode: 'work'
      });
    }

    // מצב חברים חדש - כרגע בבנייה
    if (mode === 'friends_fun') {
      Alert.alert('בקרוב', 'מצב משחק זה יהיה זמין בעדכון הבא!');
      return;
    }
  };

  // תפריט עליון - לוגיקה
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('lg_isAdult18');
    } catch (e) { }
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };
  const handleContact = () => Alert.alert('צור קשר', 'כאן ניתן להכניס מסך/קישור לצור קשר.');
  const handleFeedback = () => Alert.alert('פידבק', 'כאן נוסיף מסך פידבק.');
  const handleHelp = () => Alert.alert('עזרה', 'כאן יופיעו הוראות המשחק.');
  const handleSelectCoupleCards = () => handleChooseMode('couple');
  const handleSelectFamilyCards = () => navigation.navigate('FamilyCardsSelect', { userId, user, gameMode: 'family' });
  const handleSelectFriendsCards = () => navigation.navigate('FriendsCardsSelect', { userId, user, gameMode: 'friends' });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LiveBackground />
      <TopMenu
        navigation={navigation}
        onLogout={handleLogout}
        onContact={handleContact}
        onFeedback={handleFeedback}
        onHelp={handleHelp}
        onSelectCoupleCards={handleSelectCoupleCards}
        onSelectFamilyCards={handleSelectFamilyCards}
        onSelectFriendsCards={handleSelectFriendsCards}
      />

      <View style={styles.content}>

        {/* === HEADER SECTION === */}
        <View style={styles.headerContainer}>

          {/* 1. לוגו מסתובב */}
          <AnimatedLogo style={styles.logo} />

          {/* 2. סלוגן אנימציה חדש (לולאה) */}
          <SloganAnimation />

          {/* 3. כותרת המשנה */}
          <View style={styles.subHeaderContainer}>
            <Text style={styles.title}>בחר סגנון משחק</Text>
            <Text style={styles.subtitle}>התאימו את החוויה לרגע הזה</Text>
          </View>
        </View>
        {/* === END HEADER SECTION === */}

        <View style={styles.listContainer}>
          
          {/* כרטיס 1: זוגי */}
          <ModeCard
            title="זוגי רומנטי"
            subtitle="זמן של אהבה וקירבה"
            icon="heart-multiple"
            colors={['rgba(255, 65, 108, 0.9)', 'rgba(255, 75, 43, 0.9)']}
            onPress={() => handleChooseMode('couple')}
            delay={500}
            customStyle={{ alignSelf: 'flex-end', borderTopLeftRadius: 50, borderBottomLeftRadius: 50, borderTopRightRadius: 20, borderBottomRightRadius: 20, width: '95%' }}
            iconStyle={{ flexDirection: 'row-reverse' }}
          />

          {/* כרטיס 2: משפחה */}
          <ModeCard
            title="כל המשפחה"
            subtitle="גיבוש וצחוק משותף"
            icon="home-heart"
            colors={['rgba(86, 171, 47, 0.9)', 'rgba(168, 224, 99, 0.9)']}
            onPress={() => handleChooseMode('family')}
            delay={650}
            customStyle={{ alignSelf: 'flex-start', borderTopRightRadius: 50, borderBottomRightRadius: 50, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, width: '95%', marginTop: -12 }}
            iconStyle={{ flexDirection: 'row' }}
          />

          {/* כרטיס 3: עבודה */}
          <ModeCard
            title="צוות ועבודה"
            subtitle="שוברים את הקרח"
            icon="account-tie"
            colors={['rgba(33, 147, 176, 0.9)', 'rgba(109, 213, 237, 0.9)']}
            onPress={() => handleChooseMode('work')}
            delay={800}
            customStyle={{ alignSelf: 'flex-end', borderTopLeftRadius: 50, borderBottomLeftRadius: 50, borderTopRightRadius: 20, borderBottomRightRadius: 20, width: '95%', marginTop: -12 }}
            iconStyle={{ flexDirection: 'row-reverse' }}
          />

          {/* כרטיס 4: חברים ודרינקים (מוביל להודעה "בקרוב") */}
          <ModeCard
            title="חברים ודרינקים"
            subtitle="שטויות, צחוקים ואקשן"
            icon="glass-cocktail"
            colors={['rgba(138, 43, 226, 0.9)', 'rgba(218, 112, 214, 0.9)']}
            onPress={() => handleChooseMode('friends_fun')}
            delay={950}
            customStyle={{ alignSelf: 'flex-start', borderTopRightRadius: 50, borderBottomRightRadius: 50, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, width: '95%', marginTop: -12 }}
            iconStyle={{ flexDirection: 'row' }}
          />

        </View>
      </View>

      <Modal transparent visible={showAgeGate} animationType="fade" onRequestClose={() => setShowAgeGate(false)}>
        <AgeGate
          onConfirm={async (shouldRemember) => {
            if (shouldRemember) { try { await SecureStore.setItemAsync('lg_isAdult18', 'true'); } catch (e) { } }
            setIsAdult(true);
            setShowAgeGate(false);
            navigation.navigate('GameHome', { userId, user, gameMode: 'couple' });
          }}
          onDeny={() => setShowAgeGate(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1020',
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  headerContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 5,
  },
  sloganContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
    minHeight: 120,
    justifyContent: 'center',
  },
  subHeaderContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 5,
  },
  title: {
    fontSize: 26,
    color: '#ffffff',
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#e0e0e0',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContainer: {
    width: '100%',
    paddingBottom: 40,
  },
  cardWrapper: {
    width: '100%',
    marginBottom: 8,
  },
  cardContainer: {
    height: 88, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  contentRow: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'left',
  },
});