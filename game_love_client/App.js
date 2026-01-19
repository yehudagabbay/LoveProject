// App.js
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

// ✅ i18n + Language Provider
import { LanguageProvider } from './src/localization/LanguageContext';
import i18n from './src/localization/i18n';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text>Something went wrong.</Text>
          <Text>{this.state.error?.toString()}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const Stack = createNativeStackNavigator();

// Screens
import IndexGame from './comp/game/IndexGame';
import Registration from './comp/Registration/registration';
import SocialRegister from './comp/Registration/SocialRegister';
import Login from './comp/Login/Login';
import Settings from './comp/Settings/Settings';
import GameHome from './comp/game/GameHome';
import WelcomeScreen from './comp/Welcome/WelcomeScreen';
import GameModeSelect from './comp/Welcome/GameModeSelect';
import FriendsCardsGame from './comp/game/FriendGame/FriendsCardsGame';
import FriendsCardsSelect from './comp/game/FriendGame/FriendsCardsSelect';
import FamilyCardsSelect from './comp/game/FamilyGame/FamilyCardsSelect';
import FamilyCardsGame from './comp/game/FamilyGame/FimilyCardsGame';
import TopMenu from './comp/Settings/TopMenu';
import FeedbackScreen from './comp/Settings/FeedbackScreen';
import Help from './comp/Settings/Help';

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [langReady, setLangReady] = useState(false); // ✅ ממתינים לשפה לפני UI

  // ✅ 1) טוען שפה מה־SecureStore (ברירת מחדל en)
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const savedLang = await SecureStore.getItemAsync('app_lang');
        const lang = savedLang || 'en';
        i18n.locale = lang; // ✅ מגדיר לשימוש מיידי (גם לפני שה-Provider מסיים)
      } catch (e) {
        i18n.locale = 'en';
      } finally {
        if (mounted) setLangReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ 2) קובע initialRoute כמו שהיה לך
  useEffect(() => {
    console.log('App useEffect running');
    let mounted = true;

    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('SecureStore timeout, falling back to Welcome');
        setInitialRoute('Welcome');
      }
    }, 5000);

    (async () => {
      try {
        const raw = await SecureStore.getItemAsync('lg_user');
        console.log('SecureStore result:', raw);

        if (mounted) {
          setInitialRoute(raw ? 'GameModeSelect' : 'Welcome');
          console.log('initialRoute set to:', raw ? 'GameModeSelect' : 'Welcome');
        }
      } catch (error) {
        console.log('SecureStore error:', error);
        if (mounted) setInitialRoute('Welcome');
      } finally {
        clearTimeout(timeoutId);
      }
    })();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  // ✅ מסך טעינה עד שיש גם initialRoute וגם שפה מוכנה
  if (!initialRoute || !langReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      {/* ✅ עטיפה של כל האפליקציה בשפה */}
      <LanguageProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="GameModeSelect" component={GameModeSelect} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Registration" component={Registration} />
            <Stack.Screen name="SocialRegister" component={SocialRegister} />
            <Stack.Screen name="IndexGame" component={IndexGame} />
            <Stack.Screen name="GameHome" component={GameHome} />
            <Stack.Screen
              name="Settings"
              component={Settings}
              options={{ title: i18n.t('settings.title') }} // ✅ אפשר כבר לתרגם כותרת
            />
            <Stack.Screen name="FriendsCardsGame" component={FriendsCardsGame} />
            <Stack.Screen name="FriendsCardsSelect" component={FriendsCardsSelect} />
            <Stack.Screen name="FamilyCardsSelect" component={FamilyCardsSelect} />
            <Stack.Screen name="FamilyCardsGame" component={FamilyCardsGame} />
            <Stack.Screen name="TopMenu" component={TopMenu} />
            <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
            <Stack.Screen name="Help" component={Help} />
          </Stack.Navigator>

          <StatusBar style="auto" />
        </NavigationContainer>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
