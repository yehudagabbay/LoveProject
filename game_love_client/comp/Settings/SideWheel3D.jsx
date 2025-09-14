// comp/Settings/SideWheel3D.jsx
// רולטה עגולה: פלחים = שילובי (קטגוריה, רמה). מסתובבת ונעצרת על מצביע תחתון.
// API נשמר: same props + SideWheel3D.requestSpin() מחזיר onStop(finalIdx).

import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { G, Path, Text as SvgText, Circle, Polygon } from 'react-native-svg';

const W = Math.min(520, Math.max(320, Math.round(Dimensions.get('window').width - 40)));
const VIEW_W = Math.min(W - 16, 360);
const WHEEL_SIZE = VIEW_W;        // קוטר הגלגל
const R = WHEEL_SIZE / 2;         // רדיוס
const CX = R, CY = R;             // מרכז

// זמנים/עקומות
const BOOST_MS  = 400;
const CRUISE_MS = 1000;
const SLOW_MS   = 900;

// צבעי קטגוריה (רק מסגרת/קישוט קל)
const CAT_COLORS = { 1: '#1976D2', 2: '#009688', 3: '#E91E63' };
const BG_COLOR = '#0E5A70';       // צבע גלגל כללי
const SLICE_BORDER = '#F29F05';   // קווי פלחים

const HEART = '❤️';
const STAR  = '⭐';

// עוזר: המרה פולרית לקרטזית
function polarToCartesian(cx, cy, r, angleDeg) {
  const a = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// עוזר: path של פלח (מקטע עוגה) בין זויות start→end
function arcPath(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';

  // קשת חיצונית
  const p1 = polarToCartesian(cx, cy, rOuter, endAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, startAngle);

  // קשת פנימית (חוזרים פנימה)
  const p3 = polarToCartesian(cx, cy, rInner, startAngle);
  const p4 = polarToCartesian(cx, cy, rInner, endAngle);

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

export default function SideWheel3D({
  slices = [],             // [{categoryID, levelID}]
  enabled = true,
  spinning = false,
  setSpinning = () => {},
  onStop = () => {},
  result,
  pointerSide = 'bottom',  // מתעלמים; המצביע בתחתית
}) {
  const base = useMemo(() => (Array.isArray(slices) ? slices : []), [slices]);
  const N = Math.max(1, base.length);
  const sliceAngle = 360 / N;

  // מצביע בתחתית => זווית מצביע = 90°+180°? ב-SVG ציר y כלפי מטה
  // נאמץ "המצביע בשעה 6" = 90+180 = 270°
  const POINTER_ANGLE = 270;

  // רוטציה מונפשת (במעלות)
  const rot = useRef(new Animated.Value(0)).current;
  const rotPx = useRef(0);
  useEffect(() => {
    const id = rot.addListener(({ value }) => (rotPx.current = value));
    return () => rot.removeListener(id);
  }, [rot]);

  // מבנה אייקונים בכל פלח: מספר לבבות לפי קטגוריה, מספר כוכבים לפי רמה
  const iconsPerSlice = useMemo(() => {
    return base.map(s => {
      const hearts = HEART.repeat(Math.max(1, Math.min(3, Number(s.categoryID) || 1)));
      const stars  = STAR.repeat(Math.max(1, Math.min(3, Number(s.levelID) || 1)));
      return { hearts, stars, cat: s.categoryID, lvl: s.levelID };
    });
  }, [base]);

  // סטטי: קריאת spin מבחוץ, כמו שהיה לך
  SideWheel3D.requestSpin = () => {
    if (!enabled || spinning || N === 0) return;

    setSpinning(true);

    // יעד: בוחר אינדקס פלח
    const targetIdx = Math.floor(Math.random() * N);

    // מרכז הפלח בזווית:
    const centerOfSlice = (idx) => (idx * sliceAngle) + sliceAngle / 2;

    // כמה להסתובב כדי שמרכז הפלח ייפול על המצביע
    // ננצל מודולו 360 ונסובב עוד כמה סיבובים שלמים
    const current = rotPx.current;               // במעלות
    const spins = 4 + Math.floor(Math.random() * 3); // 4–6 סיבובים
    const desiredAngle =
      current +
      (spins * 360) +
      ((POINTER_ANGLE - centerOfSlice(targetIdx) - (current % 360) + 360) % 360);

    // רצף אנימציה
    Animated.sequence([
      Animated.timing(rot, { toValue: current + 40, duration: BOOST_MS, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(rot, { toValue: current + 40 + 360, duration: CRUISE_MS, easing: Easing.linear, useNativeDriver: false }),
      Animated.timing(rot, { toValue: desiredAngle, duration: SLOW_MS, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start(() => {
      // ניעור קטן + הֶפּטיקס
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // ננרמל לערך מודולרי כדי שלא יתנפח עם הזמן
      const norm = (rotPx.current % 360 + 360) % 360;
      rot.setValue(norm);

      setSpinning(false);
      onStop(targetIdx);
    });
  };

  // ציור הפלחים
  const ringInner = R * 0.15;      // חור פנימי קטן
  const labelRadius = (R + ringInner) / 2 + 4; // רדיוס טקסט

  // ממיר מעלות למחרוזת rotate עבור Animated (rad לא דרוש כאן)
  const rotateDeg = rot.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrap}>
      {/* מצביע תחתון (משולש) */}
      <Svg width={WHEEL_SIZE} height={WHEEL_SIZE + 40}>
        {/* גלגל מונפש */}
        <Animated.View
          style={{
            position: 'absolute',
            width: WHEEL_SIZE,
            height: WHEEL_SIZE,
            transform: [{ rotate: rotateDeg }],
          }}
        >
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
            {/* רקע גלגל */}
            <Circle cx={CX} cy={CY} r={R} fill={BG_COLOR} />

            {/* פלחים */}
            <G>
              {base.map((s, i) => {
                const start = i * sliceAngle;
                const end   = start + sliceAngle;
                const d = arcPath(CX, CY, R, ringInner, start, end);

                // קווי גבול דקים
                const border = SLICE_BORDER;
                const catColor = CAT_COLORS[s.categoryID] || '#3F51B5';

                // מיקום אייקונים – לאורך רדיוס הפלח
                const midAngle = start + sliceAngle / 2;
                const heartsPos = polarToCartesian(CX, CY, labelRadius + 6, midAngle);
                const starsPos  = polarToCartesian(CX, CY, labelRadius - 12, midAngle);

                const { hearts, stars } = iconsPerSlice[i];

                return (
                  <G key={`slice-${i}`}>
                    <Path d={d} fill="transparent" stroke={border} strokeWidth={1.5} />
                    {/* אייקוני לבבות / כוכבים */}
                    <SvgText
                      x={heartsPos.x}
                      y={heartsPos.y}
                      fontSize={18}
                      fontWeight="700"
                      textAnchor="middle"
                      fill={catColor}
                    >
                      {hearts}
                    </SvgText>

                    <SvgText
                      x={starsPos.x}
                      y={starsPos.y}
                      fontSize={16}
                      fontWeight="700"
                      textAnchor="middle"
                      fill="#FFD700"
                    >
                      {stars}
                    </SvgText>
                  </G>
                );
              })}
            </G>

            {/* עיגול מרכז קטן לקישוט */}
            <Circle cx={CX} cy={CY} r={ringInner * 0.6} fill="#083C47" stroke="#66D1E6" strokeWidth={2} />
          </Svg>
        </Animated.View>

        {/* מצביע תחתון (משולש כתום) – קבוע, הגלגל זז מתחתיו */}
        <Polygon
          points={`${CX},${WHEEL_SIZE + 2} ${CX - 22},${WHEEL_SIZE - 30} ${CX + 22},${WHEEL_SIZE - 30}`}
          fill="#E17824"
          stroke="#B85C16"
          strokeWidth={2}
        />
        {/* קו אנכי קטן למראה “קו מרכז” */}
        <Path
          d={`M ${CX} ${WHEEL_SIZE - 30} L ${CX} ${WHEEL_SIZE - 60}`}
          stroke="#8A2BE2"
          strokeWidth={3}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: VIEW_W, alignItems: 'center', justifyContent: 'center' },
});
