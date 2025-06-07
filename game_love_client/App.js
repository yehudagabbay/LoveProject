import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
const Stack = createNativeStackNavigator();


import IndexGame from './comp/game/IndexGame';
import Registration from './comp/Registration/registration';
import AdminManageUsers from './comp/AdminComp/AdminManageUsers';
import ShowingCards from './comp/AdminComp/AdminCardManager/ShowingCards';
import SocialRegister from './comp/Registration/SocialRegister';
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Registration" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Registration" component={Registration} />
        <Stack.Screen name="SocialRegister" component={SocialRegister} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
