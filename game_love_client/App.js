// App.js
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';


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


export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync('lg_user');

        // אם יש משתמש שמור → ישר לבחירת סגנון משחק
        // אם אין → מסך Welcome
        setInitialRoute(raw ? 'GameModeSelect' : 'Welcome');
      } catch {
        setInitialRoute('Welcome');
      }
    })();
  }, []);

  if (!initialRoute) return null; // אפשר להחליף במסך Splash

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="GameModeSelect" component={GameModeSelect} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Registration" component={Registration} />
        <Stack.Screen name="SocialRegister" component={SocialRegister} />
        <Stack.Screen name="IndexGame" component={IndexGame} />
        <Stack.Screen name="GameHome" component={require('./comp/game/GameHome').default} />
        <Stack.Screen name="Settings" component={Settings} options={{ title: 'הגדרות' }} />
        <Stack.Screen name="FriendsCardsGame" component={FriendsCardsGame} />
        <Stack.Screen name="FriendsCardsSelect" component={FriendsCardsSelect} />
        <Stack.Screen name="FamilyCardsSelect" component={FamilyCardsSelect} />
        <Stack.Screen name="FamilyCardsGame" component={FamilyCardsGame} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});
