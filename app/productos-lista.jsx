import React from "react";
import { FlatList, TouchableOpacity, View, Text, StyleSheet } from "react-native";

export default function ProductosList({ productos, onProductSelect }) {
  const renderProducto = ({ item }) => (
    <TouchableOpacity
      style={styles.productoContainer}
      onPress={() => onProductSelect(item)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{item.imagen}</Text>
        {item.nuevo && (
          <View style={styles.nuevoTag}>
            <Text style={styles.nuevoText}>Nuevo</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        <Text style={styles.categoria}>{item.categoria}</Text>
        <Text style={styles.estado}>{item.estado}</Text>
      </View>

      {!item.disponible && (
        <View style={styles.noDisponibleTag}>
          <Text style={styles.noDisponibleText}>No disponible</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={productos}
      renderItem={renderProducto}
      keyExtractor={(item) => item.id.toString()}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  productoContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    position: "relative",
    marginRight: 16,
  },
  icon: {
    fontSize: 40,
    width: 50,
    height: 50,
    textAlign: "center",
    lineHeight: 50,
    backgroundColor: "#f0f9f0",
    borderRadius: 25,
  },
  nuevoTag: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  nuevoText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  infoContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
  },
  categoria: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  estado: {
    fontSize: 12,
    color: "#4caf50",
    fontWeight: "500",
  },
  noDisponibleTag: {
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  noDisponibleText: {
    color: "#f44336",
    fontSize: 12,
    fontWeight: "500",
  },
});