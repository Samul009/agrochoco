import React from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";

export default function Footer({ currentScreen, onNavigate }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: "#2e7d32",
      }}
    >
      <Button
        icon="home"
        textColor="#fff"
        mode={currentScreen === "inicio" ? "contained-tonal" : "text"}
        onPress={() => onNavigate("/novedades")} 
      >
        Inicio
      </Button>
      <Button 
        icon="basket" 
        textColor="#fff" 
        mode={currentScreen === "productos" ? "contained-tonal" : "text"}
        onPress={() => onNavigate("/productos")} 
      >
        Productos
      </Button>
      <Button 
        icon="map" 
        textColor="#fff" 
        mode={currentScreen === "rutas" ? "contained-tonal" : "text"}
        onPress={() => onNavigate("/rutas")} 
      >
        Rutas
      </Button>
    </View>
  );
}