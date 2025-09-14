// comp/Settings/Settings.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { logoutAndGoHome } from '../../assets/utils/logout';


export function LogoutButton({ navigation, confirm = true, style, textStyle }) {
    const onPress = () => {
        if (confirm) {
            Alert.alert('התנתקות', 'את/ה בטוח/ה שברצונך להתנתק?', [
                { text: 'בטל', style: 'cancel' },
                { text: 'התנתק', style: 'destructive', onPress: () => logoutAndGoHome(navigation) },
            ]);
        } else {
            logoutAndGoHome(navigation);
        }
    };

    return (
        <TouchableOpacity style={[styles.logoutBtn, style]} onPress={onPress}>
            <Text style={[styles.logoutText, textStyle]}>התנתק</Text>
        </TouchableOpacity>
    );
}

export default function Settings({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>הגדרות</Text>
            <LogoutButton navigation={navigation} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f7f7fb' },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
    logoutBtn: { borderWidth: 1, borderColor: '#E53935', paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: '#fff' },
    logoutText: { color: '#E53935', fontSize: 16, fontWeight: '700' },
});
