// app/mis-productos.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_ENDPOINTS, apiRequest } from "../config/api";
import Header from "./header";
import Footer from "./footer";
import DrawerMenu from "./drawer-menu";

export default function MisProductos() {
  const router = useRouter();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalArea: 0,
    totalProduccion: 0,
    productosActivos: 0,
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Cargar usuario
      const usuarioData = await AsyncStorage.getItem("usuarioLogueado");
      if (!usuarioData) {
        Alert.alert("Error", "Debes iniciar sesión para ver tus productos");
        router.replace("/inicio-sesion");
        return;
      }

      const userData = JSON.parse(usuarioData);
      setUsuario(userData);

      // Cargar productos del productor
      await cargarProductos(userData.id);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setLoading(false);
    }
  };

  const cargarProductos = async (usuarioId) => {
    try {
      setLoading(true);
      const data = await apiRequest(
        API_ENDPOINTS.PRODUCTOS_BY_USUARIO(usuarioId),
        { method: "GET" }
      );

      setProductos(data || []);
      calcularEstadisticas(data || []);
    } catch (error) {
      console.error("Error cargando productos:", error);
      Alert.alert("Error", "No se pudieron cargar tus productos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calcularEstadisticas = (productosData) => {
    const totalProductos = productosData.length;
    const totalArea = productosData.reduce(
      (sum, p) => sum + (parseFloat(p.area_cultivada) || 0),
      0
    );
    const totalProduccion = productosData.reduce(
      (sum, p) => sum + (parseFloat(p.produccion_actual) || 0),
      0
    );
    const productosActivos = productosData.filter(
      (p) => p.estado_produccion === "Activo"
    ).length;

    setStats({
      totalProductos,
      totalArea: totalArea.toFixed(2),
      totalProduccion: totalProduccion.toFixed(2),
      productosActivos,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (usuario) {
      await cargarProductos(usuario.id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "No disponible";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleNavigate = (route, params = {}) => {
    if (route.startsWith("/")) {
      router.push({ pathname: route, params });
    } else {
      router.push(route);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Cargando tus productos...</Text>
      </View>
    );
  }

  return (
    <DrawerMenu onNavigate={handleNavigate}>
      {({ openDrawer }) => (
        <View style={styles.container}>
          <Header onMenuPress={openDrawer} title="Mis Productos" />

          <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {/* Estadísticas */}
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>📊 Resumen de Producción</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Ionicons name="leaf" size={24} color="#4caf50" />
                  <Text style={styles.statValue}>{stats.totalProductos}</Text>
                  <Text style={styles.statLabel}>Productos</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="resize" size={24} color="#2196F3" />
                  <Text style={styles.statValue}>{stats.totalArea}</Text>
                  <Text style={styles.statLabel}>Hectáreas</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="scale" size={24} color="#FF9800" />
                  <Text style={styles.statValue}>{stats.totalProduccion}</Text>
                  <Text style={styles.statLabel}>Toneladas</Text>
                </View>
                <View style={styles.statCard}>
                  <Ionicons name="checkmark-circle" size={24} color="#2e7d32" />
                  <Text style={styles.statValue}>{stats.productosActivos}</Text>
                  <Text style={styles.statLabel}>Activos</Text>
                </View>
              </View>
            </View>

            {/* Lista de productos */}
            {productos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="leaf-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>
                  No tienes productos registrados aún
                </Text>
                <Text style={styles.emptySubtext}>
                  Regístrate como productor de un producto para comenzar
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push("/productos")}
                >
                  <Text style={styles.emptyButtonText}>
                    Ver productos disponibles
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              productos.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.productCard}
                  onPress={() =>
                    router.push(`/producto-detalle/${item.producto_id}`)
                  }
                >
                  <View style={styles.productHeader}>
                    {item.imagen ? (
                      <Image
                        source={{ uri: item.imagen }}
                        style={styles.productImage}
                      />
                    ) : (
                      <View style={styles.productImagePlaceholder}>
                        <Ionicons name="image-outline" size={32} color="#999" />
                      </View>
                    )}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>
                        {item.producto_nombre}
                      </Text>
                      <Text style={styles.productCategory}>
                        {item.categoria || "Sin categoría"}
                      </Text>
                      <View style={styles.productStatus}>
                        <View
                          style={[
                            styles.statusBadge,
                            item.estado_produccion === "Activo"
                              ? styles.statusActive
                              : styles.statusInactive,
                          ]}
                        >
                          <Text style={[
                            styles.statusText,
                            { color: item.estado_produccion === "Activo" ? "#2e7d32" : "#c62828" }
                          ]}>
                            {item.estado_produccion || "Inactivo"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.productDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="resize" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        Área: {item.area_cultivada || "0"} hectáreas
                      </Text>
                    </View>
                    {item.produccion_actual && (
                      <View style={styles.detailRow}>
                        <Ionicons name="scale" size={16} color="#666" />
                        <Text style={styles.detailText}>
                          Producción: {item.produccion_actual} toneladas
                        </Text>
                      </View>
                    )}
                    {item.fecha_inicio_produccion && (
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={16} color="#666" />
                        <Text style={styles.detailText}>
                          Inicio: {formatDate(item.fecha_inicio_produccion)}
                        </Text>
                      </View>
                    )}
                    {item.producto_estado && (
                      <View style={styles.detailRow}>
                        <Ionicons name="information-circle" size={16} color="#666" />
                        <Text style={styles.detailText}>
                          Estado: {item.producto_estado}
                        </Text>
                      </View>
                    )}
                  </View>

                  {item.notas && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>Notas:</Text>
                      <Text style={styles.notesText}>{item.notas}</Text>
                    </View>
                  )}

                  {item.precio_libra && (
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceLabel}>Precio por libra:</Text>
                      <Text style={styles.priceValue}>
                        {formatCurrency(item.precio_libra)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.productFooter}>
                    <Ionicons name="chevron-forward" size={20} color="#4caf50" />
                    <Text style={styles.viewDetailText}>Ver detalles</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}

            <View style={styles.bottomSpacing} />
          </ScrollView>

          <Footer 
            currentScreen="productos"
            onNavigate={(route) => router.push(route)}
          />
        </View>
      )}
    </DrawerMenu>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  productCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  productStatus: {
    flexDirection: "row",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "#e8f5e9",
  },
  statusInactive: {
    backgroundColor: "#ffebee",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  productDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#fff9e6",
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f57c00",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#666",
  },
  priceContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: "#2e7d32",
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 16,
    color: "#1b5e20",
    fontWeight: "bold",
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  viewDetailText: {
    fontSize: 14,
    color: "#4caf50",
    fontWeight: "600",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 20,
  },
});

