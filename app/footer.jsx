import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-paper";

export default function Footer({ currentScreen, onNavigate }) {
  return (
    <View style={styles.container}>
      <Button
        icon="home"
        textColor={currentScreen === "inicio" ? "#1b5e20" : "#fff"}
        buttonColor={currentScreen === "inicio" ? "#a5d6a7" : "transparent"}
        mode={currentScreen === "inicio" ? "contained" : "text"}
        onPress={() => onNavigate("/novedades")}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Inicio
      </Button>
      <Button 
        icon="basket" 
        textColor={currentScreen === "productos" ? "#1b5e20" : "#fff"}
        buttonColor={currentScreen === "productos" ? "#a5d6a7" : "transparent"}
        mode={currentScreen === "productos" ? "contained" : "text"}
        onPress={() => onNavigate("/productos")}
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Productos
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#2e7d32",
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  button: {
    borderRadius: 20,
    minWidth: 120,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});