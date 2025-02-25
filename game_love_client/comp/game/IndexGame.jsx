import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Svg, G, Path } from "react-native-svg";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";

const windowWidth = Dimensions.get("window").width;
const rouletteSize = Math.min(300, windowWidth - 40);

const sections = [
  { label: "משימה 1", color: "#00FFFF" },
  { label: "משימה 2", color: "#FF0000" },
  { label: "משימה 3", color: "#FFC0CB" },
  { label: "משימה 4", color: "#00FFFF" },
  { label: "משימה 5", color: "#FF0000" },
  { label: "משימה 6", color: "#FFC0CB" },
  { label: "משימה 7", color: "#00FFFF" },
  { label: "משימה 8", color: "#FF0000" },
  { label: "משימה 8", color: "#FFC0CB" },
  { label: "משימה 8", color: "#00FFFF" },
  
];

export default function IndexGame() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const rotation = useSharedValue(0);

  const spinRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedTask(null);

    const spins = Math.floor(Math.random() * 5 + 3);
    const randomSection = Math.floor(Math.random() * sections.length);
    const degreesPerSection = 360 / sections.length;

    const targetRotation = spins * 360 + randomSection * degreesPerSection;

    rotation.value = withTiming(
      targetRotation,
      { duration: 3000 },
      (finished) => {
        if (finished) {
          runOnJS(setIsSpinning)(false);
          runOnJS(setSelectedTask)(sections[randomSection].label);
        }
      }
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>רולטה מסתובבת</Text>

      <View style={styles.rouletteContainer}>
        <View style={styles.pointer} />

        <Animated.View style={[animatedStyle, styles.roulette]}>
          <Svg width={rouletteSize} height={rouletteSize} viewBox={`0 0 ${rouletteSize} ${rouletteSize}`}>
            <G>
              {sections.map((section, index) => {
                const startAngle = (index * 360) / sections.length;
                const endAngle = ((index + 1) * 360) / sections.length;
                const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

                const x1 = rouletteSize / 2 + (rouletteSize / 2) * Math.cos((startAngle * Math.PI) / 180);
                const y1 = rouletteSize / 2 + (rouletteSize / 2) * Math.sin((startAngle * Math.PI) / 180);
                const x2 = rouletteSize / 2 + (rouletteSize / 2) * Math.cos((endAngle * Math.PI) / 180);
                const y2 = rouletteSize / 2 + (rouletteSize / 2) * Math.sin((endAngle * Math.PI) / 180);

                return (
                  <Path
                    key={index}
                    d={`M${rouletteSize / 2},${rouletteSize / 2} L${x1},${y1} A${rouletteSize / 2},${rouletteSize / 2} 0 ${largeArcFlag},1 ${x2},${y2} Z`}
                    fill={section.color}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </View>

      <TouchableOpacity style={styles.button} onPress={spinRoulette} disabled={isSpinning}>
        <Text style={styles.buttonText}>
          {isSpinning ? "מסתובב..." : selectedTask ? "סובב שוב" : "סובב רולטה"}
        </Text>
      </TouchableOpacity>

      {selectedTask && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => alert(`המשימה שלכם: ${selectedTask}`)}
        >
          <Text style={styles.buttonText}>חשוף קלף</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  rouletteContainer: {
    width: rouletteSize,
    height: rouletteSize,
    justifyContent: "center",
    alignItems: "center",
  },
  pointer: {
    position: "absolute",
    top: 0,
    left: "50%",
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "red",
    marginLeft: -10,
    zIndex: 1,
  },
  roulette: {
    position: "absolute",
    width: rouletteSize,
    height: rouletteSize,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

