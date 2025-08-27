import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Switch } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import productosData from "../productos.json";

export default function ProductoDetalle() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [producto, setProducto] = useState(null);
  const [notificacionesCosecha, setNotificacionesCosecha] = useState(false);
  const [notificacionesProduccion, setNotificacionesProduccion] = useState(false);

  useEffect(() => {
    const productoEncontrado = productosData.find(p => p.id.toString() === id);
    setProducto(productoEncontrado);
  }, [id]);

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const handleGuardarInfo = () => {
    Alert.alert(
      "Información guardada",
      "Las configuraciones de notificaciones han sido guardadas exitosamente.",
      [{ text: "OK" }]
    );
  };

  if (!producto) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Text style={styles.productImage}>{producto.imagen}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{producto.estado}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.productName}>{producto.nombre}</Text>
          <Text style={styles.productCategory}>{producto.categoria}</Text>
          
          <Text style={styles.description}>{producto.descripcion}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Ionicons name="location" size={20} color="#2e7d32" />
              <Text style={styles.detailTitle}>Ubicación de cosecha</Text>
            </View>
            <Text style={styles.detailText}>{producto.ubicacion_cosecha}</Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Ionicons name="calendar" size={20} color="#2e7d32" />
              <Text style={styles.detailTitle}>Temporada de cosecha</Text>
            </View>
            <Text style={styles.detailText}>{producto.temporada_cosecha}</Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Ionicons name="hand-left" size={20} color="#2e7d32" />
              <Text style={styles.detailTitle}>Método de cosecha</Text>
            </View>
            <Text style={styles.detailText}>{producto.metodo_cosecha}</Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <Ionicons name="analytics" size={20} color="#2e7d32" />
              <Text style={styles.detailTitle}>Producción por hectárea</Text>
            </View>
            <Text style={styles.detailText}>{producto.produccion_toneladas}</Text>
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.priceTitle}>Precios actuales</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Por libra:</Text>
              <Text style={styles.priceValue}>{formatearPrecio(producto.precios.libra)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Por bulto:</Text>
              <Text style={styles.priceValue}>{formatearPrecio(producto.precios.bulto)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Por camión:</Text>
              <Text style={styles.priceValue}>{formatearPrecio(producto.precios.camion)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.notificationsSection}>
          <Text style={styles.notificationsTitle}>Notificaciones</Text>
          
          <View style={styles.notificationRow}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationLabel}>Cosecha</Text>
              <Text style={styles.notificationDesc}>Avisos sobre temporadas de cosecha</Text>
            </View>
            <Switch
              value={notificacionesCosecha}
              onValueChange={setNotificacionesCosecha}
              color="#4caf50"
            />
          </View>

          <View style={styles.notificationRow}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationLabel}>Producción</Text>
              <Text style={styles.notificationDesc}>Alertas de niveles de producción</Text>
            </View>
            <Switch
              value={notificacionesProduccion}
              onValueChange={setNotificacionesProduccion}
              color="#4caf50"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleGuardarInfo}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text style={styles.saveButtonText}>Información guardada</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#2e7d32",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: "#4caf50",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  productImage: {
    fontSize: 80,
  },
  statusBadge: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#ff9800",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  detailsContainer: {
    paddingHorizontal: 16,
  },
  detailCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2e7d32",
    marginLeft: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  priceCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2e7d32",
  },
  notificationsSection: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 16,
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  notificationInfo: {
    flex: 1,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  notificationDesc: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: "#ff9800",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  bottomSpacing: {
    height: 20,
  },
});