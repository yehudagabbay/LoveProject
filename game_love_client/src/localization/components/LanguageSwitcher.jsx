import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { useLanguage } from '../LanguageContext';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);

  const currentLabel = lang === 'he' ? 'עברית' : 'English';

  const pick = async (newLang) => {
    setOpen(false);
    await setLang(newLang); // ✅ שינוי מיידי
  };

  return (
    <View>
      <TouchableOpacity style={styles.btn} onPress={() => setOpen(true)}>
        <Text style={styles.btnText}>{currentLabel} ▾</Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            <Pressable style={styles.item} onPress={() => pick('en')}>
              <Text style={styles.itemText}>English</Text>
            </Pressable>
            <Pressable style={styles.item} onPress={() => pick('he')}>
              <Text style={styles.itemText}>עברית</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },
  btnText: { fontSize: 14, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-start' },
  menu: {
    marginTop: 60,
    marginLeft: 14,
    width: 140,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  item: { paddingVertical: 12, paddingHorizontal: 12 },
  itemText: { fontSize: 16 },
});
