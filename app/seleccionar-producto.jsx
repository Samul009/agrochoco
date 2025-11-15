// app/seleccionar-producto.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export default function SeleccionarProducto() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_ENDPOINTS.PRODUCTOS, {
        method: "GET",
      });
      
      if (Array.isArray(response)) {
        setProductos(response);
      } else {
        setProductos([]);
      }
    } catch (error) {
      console.error("Error cargando productos:", error);
      setProductos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarProductos();
  };

  const handleSeleccionarProducto = (producto) => {
    router.push({
      pathname: "/registro-productor",
      params: {
        producto_id: producto.id.toString(),
        nombre: producto.nombre,
      },
    });
  };

  const renderProducto = ({ item }) => (
    <TouchableOpacity
      style={styles.productoCard}
      onPress={() => handleSeleccionarProducto(item)}
      activeOpacity={0.7}
    >
      <View style={styles.productoHeader}>
        <View style={styles.productoImagenContainer}>
          {item.imagen && typeof item.imagen === "string" && item.imagen.length > 0 ? (
            item.imagen.startsWith("http") ? (
              <Image source={{ uri: item.imagen }} style={styles.productoImagen} />
            ) : (
              <Text style={styles.productoEmoji}>{item.imagen}</Text>
            )
          ) : (
            <Ionicons name="leaf" size={40} color="#4caf50" />
          )}
        </View>
        <View style={styles.productoInfo}>
          <Text style={styles.productoNombre}>{item.nombre}</Text>
          <Text style={styles.productoCategoria}>{item.categoria}</Text>
          {item.descripcion && (
            <Text style={styles.productoDescripcion} numberOfLines={2}>
              {item.descripcion}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </View>
      <View style={styles.productoFooter}>
        <View style={styles.estadoBadge}>
          <Ionicons
            name={item.disponible ? "checkmark-circle" : "close-circle"}
            size={16}
            color={item.disponible ? "#4caf50" : "#999"}
          />
          <Text style={styles.estadoText}>
            {item.estado || (item.disponible ? "Disponible" : "No disponible")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="leaf-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No hay productos disponibles</Text>
      <Text style={styles.emptySubtext}>
        Vuelve más tarde para registrarte como productor
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Seleccionar Producto</Text>
          <Text style={styles.headerSubtitle}>
            Elige el producto para registrarte como productor
          </Text>
        </View>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={productos}
        renderItem={renderProducto}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#4caf50"]}
          />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#2e7d32",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  productoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  productoImagenContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  productoImagen: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  productoEmoji: {
    fontSize: 30,
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  productoCategoria: {
    fontSize: 14,
    color: "#4caf50",
    fontWeight: "600",
    marginBottom: 4,
  },
  productoDescripcion: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  productoFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
    textAlign: "center",
  },
});

