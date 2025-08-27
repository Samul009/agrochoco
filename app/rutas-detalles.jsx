import React from "react";
import { View, ScrollView } from "react-native";
import { Text, Card } from "react-native-paper";
import { useLocalSearchParams } from "expo-router";
import rutasData from "../rutas.json";

export default function RutaDetalle() {
  const { id } = useLocalSearchParams();
  const ruta = rutasData.find((r) => r.id == id);

  if (!ruta) return <Text>No se encontró la ruta</Text>;

  return (
    <ScrollView style={{ flex: 1, padding: 15, backgroundColor: "#fff" }}>
      <Card style={{ marginBottom: 15 }}>
        <Card.Title title={ruta.producto} subtitle={`Región: ${ruta.region}`} />
        <Card.Content>
          <Text>Empresas interesadas: {ruta.empresas.join(", ")}</Text>
          <Text>Destinos: {ruta.destinos.join(", ")}</Text>
          <Text>Consumo: {ruta.consumo}</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
