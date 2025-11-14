// producto-detalle/[id].jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Switch } from "react-native-paper";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { API_ENDPOINTS, apiRequest } from "../../config/api"; // CORREGIDO: Subir dos niveles

export default function ProductoDetalle() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [producto, setProducto] = useState(null);
  const [productores, setProductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificacionesCosecha, setNotificacionesCosecha] = useState(false);
  const [notificacionesProduccion, setNotificacionesProduccion] = useState(false);

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      console.log('📦 Cargando datos del producto ID:', id);
      
      // Cargar producto
      const dataProducto = await apiRequest(API_ENDPOINTS.PRODUCTO_BY_ID(id));
      console.log('✅ Producto cargado:', dataProducto);
      setProducto(dataProducto);
      
      // Cargar productores asociados
      try {
        const dataProductores = await apiRequest(API_ENDPOINTS.PRODUCTORES_BY_PRODUCTO(id));
        console.log('✅ Productores cargados:', dataProductores.length);
        setProductores(dataProductores);
      } catch (error) {
        console.log('⚠️ No hay productores para este producto');
        setProductores([]);
      }
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo cargar el producto',
        [{ text: 'Volver', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const formatearPrecio = (precio) => {
    if (!precio) return 'N/A';
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

  const handleEditar = () => {
    router.push(`/formulario-producto?id=${id}`);
  };

  const handleRegistrarseProductor = () => {
    router.push(`/registro-productor?producto_id=${id}&nombre=${producto.nombre}`);
  };

  const handleContactarProductor = (productor) => {
    const mensaje = `Información de contacto:\n\nNombre: ${productor.productor_nombre}\nTeléfono: ${productor.telefono || 'No disponible'}\nEmail: ${productor.email}\nDirección: ${productor.direccion || 'No disponible'}`;
    
    Alert.alert(
      'Contactar Productor',
      mensaje,
      [
        { text: 'Cerrar', style: 'cancel' },
        productor.telefono && {
          text: 'Llamar',
          onPress: () => {
            // Aquí puedes integrar con Linking para hacer la llamada
            console.log('Llamar a:', productor.telefono);
          }
        }
      ].filter(Boolean)
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Cargando producto...</Text>
      </View>
    );
  }

  if (!producto) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Producto no encontrado</Text>
        <TouchableOpacity
          style={styles.backButtonCenter}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Detalles del Producto</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditar}
        >
          <Ionicons name="create-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Text style={styles.productImage}>{producto.imagen || '🌾'}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{producto.estado || 'Disponible'}</Text>
          </View>
          {producto.nuevo && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NUEVO</Text>
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.productName}>{producto.nombre}</Text>
          <Text style={styles.productCategory}>{producto.categoria}</Text>
          
          {producto.descripcion && (
            <Text style={styles.description}>{producto.descripcion}</Text>
          )}

          <View style={styles.statsContainer}>
            {producto.total_productores > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="people" size={20} color="#4caf50" />
                <Text style={styles.statText}>
                  {producto.total_productores} productor{producto.total_productores !== 1 ? 'es' : ''}
                </Text>
              </View>
            )}

            {producto.area_total > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="resize" size={20} color="#4caf50" />
                <Text style={styles.statText}>
                  {producto.area_total.toFixed(2)} ha
                </Text>
              </View>
            )}

            {producto.produccion_total > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="analytics" size={20} color="#4caf50" />
                <Text style={styles.statText}>
                  {producto.produccion_total.toFixed(2)} ton
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          {producto.ubicacion_cosecha && (
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Ionicons name="location" size={20} color="#2e7d32" />
                <Text style={styles.detailTitle}>Ubicación de cosecha</Text>
              </View>
              <Text style={styles.detailText}>{producto.ubicacion_cosecha}</Text>
            </View>
          )}

          {producto.temporada_cosecha && (
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Ionicons name="calendar" size={20} color="#2e7d32" />
                <Text style={styles.detailTitle}>Temporada de cosecha</Text>
              </View>
              <Text style={styles.detailText}>{producto.temporada_cosecha}</Text>
            </View>
          )}

          {producto.metodo_cosecha && (
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Ionicons name="hand-left" size={20} color="#2e7d32" />
                <Text style={styles.detailTitle}>Método de cosecha</Text>
              </View>
              <Text style={styles.detailText}>{producto.metodo_cosecha}</Text>
            </View>
          )}

          {producto.produccion_toneladas && (
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Ionicons name="analytics" size={20} color="#2e7d32" />
                <Text style={styles.detailTitle}>Producción por hectárea</Text>
              </View>
              <Text style={styles.detailText}>{producto.produccion_toneladas}</Text>
            </View>
          )}

          {producto.precios && (producto.precios.libra || producto.precios.bulto || producto.precios.camion) && (
            <View style={styles.priceCard}>
              <Text style={styles.priceTitle}>Precios actuales</Text>
              
              {producto.precios.libra > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Por libra:</Text>
                  <Text style={styles.priceValue}>{formatearPrecio(producto.precios.libra)}</Text>
                </View>
              )}
              
              {producto.precios.bulto > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Por bulto:</Text>
                  <Text style={styles.priceValue}>{formatearPrecio(producto.precios.bulto)}</Text>
                </View>
              )}
              
              {producto.precios.camion > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Por camión:</Text>
                  <Text style={styles.priceValue}>{formatearPrecio(producto.precios.camion)}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* SECCIÓN DE PRODUCTORES */}
        <View style={styles.productoresSection}>
          <View style={styles.productoresSectionHeader}>
            <Text style={styles.productoresSectionTitle}>Productores Registrados</Text>
            <TouchableOpacity
              style={styles.registrarseButton}
              onPress={handleRegistrarseProductor}
            >
              <Ionicons name="person-add" size={16} color="white" />
              <Text style={styles.registrarseButtonText}>Registrarme</Text>
            </TouchableOpacity>
          </View>

          {productores.length === 0 ? (
            <View style={styles.noProductoresContainer}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.noProductoresText}>
                Aún no hay productores registrados
              </Text>
              <Text style={styles.noProductoresSubtext}>
                ¡Sé el primero en registrarte!
              </Text>
            </View>
          ) : (
            productores.map((productor) => (
              <View key={productor.id} style={styles.productorCard}>
                <View style={styles.productorHeader}>
                  <View style={styles.productorIconContainer}>
                    <Ionicons name="person" size={24} color="#4caf50" />
                  </View>
                  <View style={styles.productorInfo}>
                    <Text style={styles.productorNombre}>{productor.productor_nombre}</Text>
                    <Text style={styles.productorEmail}>{productor.email}</Text>
                  </View>
                </View>

                {(productor.area_cultivada || productor.produccion_actual) && (
                  <View style={styles.productorStats}>
                    {productor.area_cultivada && (
                      <View style={styles.productorStat}>
                        <Ionicons name="leaf" size={16} color="#666" />
                        <Text style={styles.productorStatText}>
                          {productor.area_cultivada} ha
                        </Text>
                      </View>
                    )}
                    {productor.produccion_actual && (
                      <View style={styles.productorStat}>
                        <Ionicons name="bar-chart" size={16} color="#666" />
                        <Text style={styles.productorStatText}>
                          {productor.produccion_actual} ton
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.contactarButton}
                  onPress={() => handleContactarProductor(productor)}
                >
                  <Ionicons name="call" size={16} color="#4caf50" />
                  <Text style={styles.contactarButtonText}>Contactar</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
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
          <Text style={styles.saveButtonText}>Guardar configuración</Text>
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
    flex: 1,
  },
  editButton: {
    padding: 4,
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
  newBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#f44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  newBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    fontWeight: '500',
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
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
  productoresSection: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  productoresSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productoresSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  registrarseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  registrarseButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  noProductoresContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noProductoresText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
  noProductoresSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  productorCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productorIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  productorInfo: {
    flex: 1,
  },
  productorNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productorEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  productorStats: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  productorStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productorStatText: {
    fontSize: 12,
    color: '#666',
  },
  contactarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
    gap: 6,
  },
  contactarButtonText: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationsSection: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
    backgroundColor: "#4caf50",
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
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  backButtonCenter: {
    marginTop: 20,
    backgroundColor: "#2e7d32",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 20,
  },
});