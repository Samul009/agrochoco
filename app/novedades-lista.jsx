import React from "react";
import { ScrollView } from "react-native";
import { Card, Text } from "react-native-paper";

export default function NovedadesList({ novedades }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {novedades.map((item) => (
        <Card key={item.id} style={{ margin: 10, borderRadius: 12 }}>
          <Card.Cover source={{ uri: item.imagen }} style={{ height: 150 }} />
          <Card.Content>
            <Text variant="titleLarge" style={{ marginTop: 10, fontWeight: "bold" }}>
              {item.titulo}
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 5, color: "#555" }}>
              {item.descripcion}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}
