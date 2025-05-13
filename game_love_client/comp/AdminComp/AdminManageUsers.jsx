import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // שליפת הנתונים מהשרת
  useEffect(() => {
    fetch('http://lovegame.somee.com/api/Users')
      .then(response => response.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('שגיאה בשליפה:', error);
        setLoading(false);
      });
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.userID}</Text>
      <Text style={styles.cell}>{item.nickname}</Text>
      <Text style={styles.cell}>{item.email}</Text>
      <Text style={styles.cell}>{item.age}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>רשימת משתמשים</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.userID.toString()}
          ListHeaderComponent={
            <View style={[styles.row, styles.header]}>
              <Text style={styles.cell}>ID</Text>
              <Text style={styles.cell}>כינוי</Text>
              <Text style={styles.cell}>אימייל</Text>
              <Text style={styles.cell}>גיל</Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  row: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 6 },
  header: { backgroundColor: '#eee' },
  cell: { flex: 1, textAlign: 'center' },
});
