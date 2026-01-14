// App.js
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Something went wrong.</Text>
          <Text>{this.state.error?.toString()}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}


const Stack = createNativeStackNavigator();

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
import  GameTimer from './comp/Settings/GameTimer';
import AgeGate from './comp/Settings/AgeGate';
import TopMenu from './comp/Settings/TopMenu';
import FeedbackScreen from './comp/Settings/FeedbackScreen';
import Help from './comp/Settings/Help';


export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    console.log('App useEffect running');
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync('lg_user');
        console.log('SecureStore result:', raw);

        // אם יש משתמש שמור → ישר לבחירת סגנון משחק
        // אם אין → מסך Welcome
        setInitialRoute(raw ? 'GameModeSelect' : 'Welcome');
        console.log('initialRoute set to:', raw ? 'GameModeSelect' : 'Welcome');
      } catch (error) {
        console.log('SecureStore error:', error);
        setInitialRoute('Welcome');
      }
    })();
  }, []);

  if (!initialRoute) return null; // אפשר להחליף במסך Splash

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="GameModeSelect" component={GameModeSelect} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Registration" component={Registration} />
          <Stack.Screen name="SocialRegister" component={SocialRegister} />
          <Stack.Screen name="IndexGame" component={IndexGame} />
          <Stack.Screen name="GameHome" component={GameHome} />
          <Stack.Screen name="Settings" component={Settings} options={{ title: 'הגדרות' }} />
          <Stack.Screen name="FriendsCardsGame" component={FriendsCardsGame} />
          <Stack.Screen name="FriendsCardsSelect" component={FriendsCardsSelect} />
          <Stack.Screen name="FamilyCardsSelect" component={FamilyCardsSelect} />
          <Stack.Screen name="FamilyCardsGame" component={FamilyCardsGame} />
          <Stack.Screen name ="TopMenu" component={TopMenu} />
          <Stack.Screen name ="FeedbackScreen" component={FeedbackScreen} />
          <Stack.Screen name="Help" component={Help}/>
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});
