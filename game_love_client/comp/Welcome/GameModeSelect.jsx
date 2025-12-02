// comp/Welcome/GameModeSelect.jsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing, // הוספנו את זה בשביל האנימציה החלקה
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// --- חלק 1: לוגיקה של הרקע החי (כדורים מרחפים) ---

const FloatingOrb = ({ color, size, startX, startY, duration, delay }) => {
  const moveAnim = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // אנימציית תנועה
    const float = () => {
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: {
            x: startX + (Math.random() * 80 - 40),
            y: startY + (Math.random() * 80 - 40),
          },
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: { x: startX, y: startY },
          duration: duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(() => float());
    };

    // אנימציית נשימה (גודל)
    const breathe = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.1, duration: duration * 0.5, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: duration * 0.5, useNativeDriver: true }),
        ])
      ).start();
    };

    setTimeout(() => { float(); breathe(); }, delay);
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: 0.6, // שקיפות
        transform: [{ translateX: moveAnim.x }, { translateY: moveAnim.y }, { scale: scaleAnim }],
      }}
    />
  );
};

// קומפוננטת הרקע שתופסת את כל המסך
const LiveBackground = () => (
  <View style={StyleSheet.absoluteFill}>
    {/* צבע בסיס כהה */}
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0f172a' }]} />
    
    {/* הכדורים הצפים */}
    <FloatingOrb color="#EF4444" size={300} startX={-50} startY={-50} duration={6000} delay={0} />
    <FloatingOrb color="#3B82F6" size={350} startX={width - 200} startY={height - 300} duration={7000} delay={1000} />
    <FloatingOrb color="#10B981" size={280} startX={-100} startY={height / 2} duration={8000} delay={500} />

    {/* שכבת טשטוש וכהות מעל הכדורים כדי שהטקסט יהיה קריא */}
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 23, 42, 0.7)' }]} />
  </View>
);

// --- חלק 2: כרטיס הבחירה (נשאר זהה לקוד שלך) ---

const ModeCard = ({ title, subtitle, icon, colors, onPress, delay, customStyle, iconStyle }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, delay: delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 40, delay: delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, styles.cardWrapper]}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[styles.cardContainer, customStyle]}>
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.cardGradient, customStyle]}>
          <View style={[styles.contentRow, iconStyle]}>
             <View style={styles.iconContainer}>
               <MaterialCommunityIcons name={icon} size={30} color="#fff" />
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

// --- חלק 3: המסך הראשי ---

export default function GameModeSelect({ navigation, route }) {
  const userId = route?.params?.userId ?? null;
  const user = route?.params?.user ?? null;

  const handleChooseMode = (mode) => {
    const params = { userId, user, gameMode: mode };
    if (mode === 'couple') return navigation.navigate('GameHome', params);
    if (mode === 'family') return navigation.navigate('FamilyCardsSelect', { gameMode: 'family' });
    if (mode === 'friends') return navigation.navigate('FriendsCardsSelect', params);
  };

  return (
    // הורדנו את ImageBackground ושמנו View רגיל שעוטף הכל
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* הרקע החי יושב בשכבה הכי תחתונה */}
      <LiveBackground />
      
      {/* התוכן יושב מעליו */}
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>בחר סגנון משחק</Text>
          <Text style={styles.subtitle}>התאימו את החוויה לרגע הזה</Text>
        </View>

        <View style={styles.listContainer}>
          <ModeCard
            title="זוגי רומנטי"
            subtitle="זמן של אהבה וקירבה"
            icon="heart-multiple"
            colors={['rgba(255, 65, 108, 0.9)', 'rgba(255, 75, 43, 0.9)']} // צבעים עם קצת שקיפות
            onPress={() => handleChooseMode('couple')}
            delay={0}
            customStyle={{ alignSelf: 'flex-end', borderTopLeftRadius: 50, borderBottomLeftRadius: 50, borderTopRightRadius: 20, borderBottomRightRadius: 20, width: '95%' }}
            iconStyle={{ flexDirection: 'row-reverse' }}
          />
          <ModeCard
            title="כל המשפחה"
            subtitle="גיבוש וצחוק משותף"
            icon="home-heart"
            colors={['rgba(86, 171, 47, 0.9)', 'rgba(168, 224, 99, 0.9)']}
            onPress={() => handleChooseMode('family')}
            delay={150}
            customStyle={{ alignSelf: 'flex-start', borderTopRightRadius: 50, borderBottomRightRadius: 50, borderTopLeftRadius: 20, borderBottomLeftRadius: 20, width: '95%', marginTop: -15 }}
            iconStyle={{ flexDirection: 'row' }}
          />
          <ModeCard
            title="חברים ועבודה"
            subtitle="שוברים את הקרח"
            icon="account-group"
            colors={['rgba(33, 147, 176, 0.9)', 'rgba(109, 213, 237, 0.9)']}
            onPress={() => handleChooseMode('friends')}
            delay={300}
            customStyle={{ alignSelf: 'flex-end', borderTopLeftRadius: 50, borderBottomLeftRadius: 50, borderTopRightRadius: 20, borderBottomRightRadius: 20, width: '95%', marginTop: -15 }}
            iconStyle={{ flexDirection: 'row-reverse' }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1020', // גיבוי למקרה שהאנימציה לא נטענת
  },
  content: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 10,
    zIndex: 10, // מוודא שהתוכן לחיץ ונמצא מעל הרקע
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 17,
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
    marginBottom: 10,
  },
  cardContainer: {
    height: 100,
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
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'left',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'left',
  },
});