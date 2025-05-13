import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import IndexGame from './comp/game/IndexGame';
import Registration from './comp/Registration/registration';
import AdminManageUsers from './comp/AdminComp/AdminManageUsers';
import ShowingCards from './comp/AdminComp/AdminCardManager/ShowingCards';
export default function App() {
  return (
    <View style={styles.container}>
      {/* <IndexGame /> */}
      <Registration/>
      {/* <AdminManageUsers /> */}
      {/* <ShowingCards/> */}
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
