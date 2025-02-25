import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import IndexGame from './comp/game/IndexGame'; // נתיב תקין לרכיב
import Registration from './comp/Registration/registration';

export default function App() {
  return (
    <View style={styles.container}>
      {/* <IndexGame /> */}
      <Registration/>
      <StatusBar style="auto" />
    </View>
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
