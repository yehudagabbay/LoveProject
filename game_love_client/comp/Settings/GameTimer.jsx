// comp/game/common/GameTimer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';

export const GameTimer = ({ initialMode = 'timer', defaultTime = 60 }) => {
  const [mode, setMode] = useState(initialMode);
  const [seconds, setSeconds] = useState(initialMode === 'timer' ? defaultTime : 0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSeconds(mode === 'timer' ? defaultTime : 0);
  }, [mode, defaultTime]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (mode === 'stopwatch') return prev + 1;
          if (prev <= 0) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            Vibration.vibrate(); // רטט בסיום
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, mode]);

  const toggleTimer = () => setIsActive((prev) => !prev);
  
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(mode === 'timer' ? defaultTime : 0);
  };

  const adjustTime = (amount) => {
    if (mode === 'timer' && !isActive) {
      setSeconds((prev) => Math.max(10, prev + amount));
    }
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isTimer = mode === 'timer';

  return (
    <View style={styles.container}>
      
      {/* שורת טאבים עדינה לבחירת מצב */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, isTimer && styles.activeTab]} 
          onPress={() => setMode('timer')}
        >
          <Text style={[styles.tabText, isTimer && styles.activeTabText]}>טיימר</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity 
          style={[styles.tab, !isTimer && styles.activeTab]} 
          onPress={() => setMode('stopwatch')}
        >
          <Text style={[styles.tabText, !isTimer && styles.activeTabText]}>סטופר</Text>
        </TouchableOpacity>
      </View>

      {/* האזור המרכזי - שעון וכפתורי כיוון */}
      <View style={styles.mainDisplay}>
        {/* כפתור מינוס (רק בטיימר במצב עצירה) */}
        <TouchableOpacity
          disabled={!isTimer || isActive}
          onPress={() => adjustTime(-10)}
          style={[styles.adjustBtn, (!isTimer || isActive) && styles.hidden]}
        >
          <Text style={styles.adjustText}>-10</Text>
        </TouchableOpacity>

        {/* השעון עצמו - לחיצה עליו מפעילה/עוצרת */}
        <TouchableOpacity onPress={toggleTimer} activeOpacity={0.7}>
          <Text style={[
            styles.timeText, 
            isActive && styles.timeTextActive,
            isTimer && seconds === 0 && styles.timeTextDone
          ]}>
            {formatTime(seconds)}
          </Text>
        </TouchableOpacity>

        {/* כפתור פלוס */}
        <TouchableOpacity
          disabled={!isTimer || isActive}
          onPress={() => adjustTime(10)}
          style={[styles.adjustBtn, (!isTimer || isActive) && styles.hidden]}
        >
          <Text style={styles.adjustText}>+10</Text>
        </TouchableOpacity>
      </View>

      {/* כפתורי שליטה ראשיים */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={resetTimer}>
          <Text style={styles.iconBtnText}>🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.playPauseBtn, isActive ? styles.bgPause : styles.bgPlay]} 
          onPress={toggleTimer}
        >
          <Text style={styles.playPauseIcon}>
            {isActive ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>

        {/* כפתור דמה לאיזון או להשתקה בעתיד */}
        <View style={[styles.iconBtn, { opacity: 0 }]} />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.6)', // שקוף-לבן (Glassmorphism)
    borderRadius: 24,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginVertical: 10,
    // צל עדין מאוד
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    alignSelf: 'center',
  },
  
  // --- טאבים ---
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    padding: 2,
    marginBottom: 10,
    width: 140,
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    paddingVertical: 4,
    borderRadius: 18,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#333',
    fontWeight: 'bold',
  },

  // --- תצוגה ראשית ---
  mainDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 15,
  },
  timeText: {
    fontSize: 48, // גדול וברור
    fontWeight: '800',
    color: '#374151',
    fontVariant: ['tabular-nums'], // מונע קפיצות של המספרים
    letterSpacing: 2,
  },
  timeTextActive: {
    color: '#2563EB', // כחול כשהוא רץ
  },
  timeTextDone: {
    color: '#EF4444', // אדום כשנגמר
  },
  
  // כפתורי +/- קטנים ועדינים
  adjustBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  adjustText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  hidden: {
    opacity: 0,
  },

  // --- שורת פעולות ---
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 5,
  },
  playPauseBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bgPlay: {
    backgroundColor: '#10B981', // ירוק להתחלה
  },
  bgPause: {
    backgroundColor: '#F59E0B', // כתום להשהיה
  },
  playPauseIcon: {
    fontSize: 24,
    color: '#fff',
    marginTop: 2, // תיקון אופטי קטן לאימוג'י
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: {
    fontSize: 16,
  },
});