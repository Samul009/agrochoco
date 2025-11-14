// productos-lista.jsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { Card, Chip } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function ProductosList({ 
  productos, 
  onProductSelect, 
  onRefresh, 
  esAdmin,
  currentPage = 1,
  itemsPerPage = 5,
  onPageChange
}) {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  
  // Calcular índices para paginación
  const totalPages = Math.ceil(productos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productosPaginados = productos.slice(startIndex, endIndex);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const formatearPrecio = (precio) => {
    if (!precio || precio === 0) return "N/A";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const parseUbicaciones = (ubicacionStr) => {
    try {
      const ubicaciones = JSON.parse(ubicacionStr);
      return Array.isArray(ubicaciones) ? ubicaciones : [ubicacionStr];
    } catch (e) {
      return [ubicacionStr];
    }
  };

  const renderProducto = ({ item }) => {
    const ubicaciones = parseUbicaciones(item.ubicacion_cosecha || "[]");
    
    return (
      <Card style={styles.card} onPress={() => onProductSelect(item)}>
        {item.nuevo && (
          <View style={styles.badgeNuevo}>
            <Text style={styles.badgeNuevoText}>NUEVO</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          {/* Imagen del producto */}
          <View style={styles.imagenContainer}>
            {item.imagen && item.imagen.startsWith('http') ? (
              <Image 
                source={{ uri: item.imagen }} 
                style={styles.productoImagen}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagenPlaceholder}>
                <Text style={styles.emojiIcon}>{item.imagen || '🌾'}</Text>
              </View>
            )}
          </View>

          {/* Información del producto */}
          <View style={styles.infoContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.nombre} numberOfLines={1}>
                {item.nombre}
              </Text>
              {!item.disponible && (
                <Chip
                  style={styles.chipNoDisponible}
                  textStyle={styles.chipNoDisponibleText}
                >
                  No disponible
                </Chip>
              )}
            </View>

            <View style={styles.categoriaRow}>
              <Chip
                icon="leaf"
                style={styles.chipCategoria}
                textStyle={styles.chipCategoriaText}
              >
                {item.categoria}
              </Chip>
              {item.total_productores > 0 && (
                <View style={styles.productoresInfo}>
                  <Ionicons name="people" size={16} color="#4caf50" />
                  <Text style={styles.productoresText}>
                    {item.total_productores} {item.total_productores === 1 ? 'productor' : 'productores'}
                  </Text>
                </View>
              )}
            </View>

            {item.descripcion && (
              <Text style={styles.descripcion} numberOfLines={2}>
                {item.descripcion}
              </Text>
            )}

            {/* Ubicaciones */}
            {ubicaciones.length > 0 && ubicaciones[0] && (
              <View style={styles.ubicacionesContainer}>
                <Ionicons name="location" size={14} color="#757575" />
                <Text style={styles.ubicacionesText} numberOfLines={1}>
                  {ubicaciones.slice(0, 2).join(", ")}
                  {ubicaciones.length > 2 && ` +${ubicaciones.length - 2}`}
                </Text>
              </View>
            )}

            {/* Precios */}
            <View style={styles.preciosContainer}>
              {item.precios?.libra > 0 && (
                <View style={styles.precioItem}>
                  <Text style={styles.precioLabel}>Libra:</Text>
                  <Text style={styles.precioValor}>
                    {formatearPrecio(item.precios.libra)}
                  </Text>
                </View>
              )}
              {item.precios?.bulto > 0 && (
                <View style={styles.precioItem}>
                  <Text style={styles.precioLabel}>Bulto:</Text>
                  <Text style={styles.precioValor}>
                    {formatearPrecio(item.precios.bulto)}
                  </Text>
                </View>
              )}
            </View>

            {/* Botones según el rol */}
            <View style={styles.actionsContainer}>
              {esAdmin ? (
                // Botones de administrador
                <View style={styles.adminActions}>
                  <TouchableOpacity
                    style={styles.btnEditar}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/formulario-producto?id=${item.id}`);
                    }}
                  >
                    <Ionicons name="pencil" size={16} color="white" />
                    <Text style={styles.btnText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnDetalle}
                    onPress={() => onProductSelect(item)}
                  >
                    <Ionicons name="eye" size={16} color="white" />
                    <Text style={styles.btnText}>Ver Detalle</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                // Botón de usuario normal
                <TouchableOpacity
                  style={styles.btnDetalleUsuario}
                  onPress={() => onProductSelect(item)}
                >
                  <Ionicons name="information-circle" size={18} color="white" />
                  <Text style={styles.btnText}>Ver más información</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="leaf-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No hay productos disponibles</Text>
      <Text style={styles.emptySubtext}>
        {esAdmin 
          ? "Toca el botón '+' para agregar productos"
          : "Vuelve más tarde para ver nuevos productos"
        }
      </Text>
    </View>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
          onPress={() => onPageChange && currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons 
            name="chevron-back" 
            size={20} 
            color={currentPage === 1 ? "#ccc" : "#2e7d32"} 
          />
          <Text style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
            Anterior
          </Text>
        </TouchableOpacity>
        
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Página {currentPage} de {totalPages}
          </Text>
          <Text style={styles.paginationSubtext}>
            ({productos.length} productos)
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
          onPress={() => onPageChange && currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
            Siguiente
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={currentPage === totalPages ? "#ccc" : "#2e7d32"} 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={productosPaginados}
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
        ListFooterComponent={renderPagination}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "white",
    overflow: 'hidden',
  },
  badgeNuevo: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#ff5722",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeNuevoText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  cardContent: {
    flexDirection: "row",
    padding: 12,
  },
  imagenContainer: {
    width: 100,
    height: 100,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  productoImagen: {
    width: '100%',
    height: '100%',
  },
  imagenPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
  },
  emojiIcon: {
    fontSize: 48,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    flex: 1,
    marginRight: 8,
  },
  categoriaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  chipCategoria: {
    backgroundColor: "#e8f5e9",
    height: 28,
    marginRight: 8,
  },
  chipCategoriaText: {
    fontSize: 12,
    color: "#2e7d32",
  },
  chipNoDisponible: {
    backgroundColor: "#ffebee",
    height: 24,
  },
  chipNoDisponibleText: {
    fontSize: 10,
    color: "#c62828",
  },
  productoresInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#f1f8e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  productoresText: {
    fontSize: 11,
    color: "#4caf50",
    marginLeft: 4,
    fontWeight: '600',
  },
  descripcion: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    lineHeight: 18,
  },
  ubicacionesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ubicacionesText: {
    fontSize: 12,
    color: "#757575",
    marginLeft: 4,
    flex: 1,
  },
  preciosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  precioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  precioLabel: {
    fontSize: 12,
    color: "#757575",
    marginRight: 4,
  },
  precioValor: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4caf50",
  },
  actionsContainer: {
    marginTop: 8,
  },
  adminActions: {
    flexDirection: "row",
    gap: 8,
  },
  btnEditar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff9800",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  btnDetalle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4caf50",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  btnDetalleUsuario: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196f3",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  btnText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#bbb",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  paginationButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginHorizontal: 4,
  },
  paginationButtonTextDisabled: {
    color: '#ccc',
  },
  paginationInfo: {
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paginationSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});