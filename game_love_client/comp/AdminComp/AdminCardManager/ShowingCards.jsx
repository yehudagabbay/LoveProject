import React, { useState } from 'react';
import { View, Text, TextInput, Button, Switch, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function CreateCardScreen() {
  const [categoryID, setCategoryID] = useState();
  const [levelID, setLevelID] = useState();
  const [cardDescription, setCardDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async () => {
    if (!categoryID || !levelID || !cardDescription.trim()) {
      Alert.alert('שגיאה', 'יש למלא את כל השדות!');
      return;
    }

    const newCard = {
      categoryID,
      levelID,
      cardDescription,
      isActive
    };

    try {
      const response = await fetch('http://loveGame.somee.com/api/Admin/create-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCard)
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('הצלחה', 'הכרטיס נוצר בהצלחה!');
      } else {
        Alert.alert('שגיאה', data.message || 'אירעה שגיאה');
      }
    } catch (error) {
      Alert.alert('שגיאה', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>בחר קטגוריה:</Text>
      <Picker
        selectedValue={categoryID}
        onValueChange={(itemValue) => setCategoryID(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="בחר..." value={undefined} />
        <Picker.Item label="רומנטיקה" value={1} />
        <Picker.Item label="אתגר" value={2} />
        <Picker.Item label="היכרות" value={3} />
      </Picker>

      <Text style={styles.label}>בחר רמת קושי:</Text>
      <Picker
        selectedValue={levelID}
        onValueChange={(itemValue) => setLevelID(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="בחר..." value={undefined} />
        <Picker.Item label="קל" value={1} />
        <Picker.Item label="בינוני" value={2} />
        <Picker.Item label="קשה" value={3} />
      </Picker>

      <Text style={styles.label}>תיאור הכרטיס:</Text>
      <TextInput
        style={styles.textInput}
        multiline
        numberOfLines={4}
        placeholder="כתוב כאן..."
        value={cardDescription}
        onChangeText={setCardDescription}
      />

      <View style={styles.switchContainer}>
        <Text>הכרטיס פעיל:</Text>
        <Switch
          value={isActive}
          onValueChange={setIsActive}
        />
      </View>

      <Button title="צור כרטיס" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 15
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  picker: {
    backgroundColor: '#f0f0f0',
    marginBottom: 10
  },
  textInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlignVertical: 'top'
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20
  }
});
