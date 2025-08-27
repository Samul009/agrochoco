import React from "react";
import { FlatList, View } from "react-native";
import { List } from "react-native-paper";

export default function RutasList({ rutas, onRutaSelect }) {
  return (
    <FlatList
      data={rutas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={{ marginBottom: 5 }}>
          <List.Item
            title={item.producto}
            description={`Región: ${item.region} | Empresas: ${item.empresas.join(", ")}`}
            left={(props) => <List.Icon {...props} icon="car" />}
            onPress={() => onRutaSelect(item)}
          />
        </View>
      )}
    />
  );
}
